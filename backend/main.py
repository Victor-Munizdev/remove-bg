from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import io
import os
from rembg import remove, new_session
from PIL import Image
from pillow_heif import register_heif_opener

# Register HEIF opener to support HEIC images from iPhone/Mac
register_heif_opener()

# For SVG conversion
try:
    import vtracer
except ImportError:
    vtracer = None

app = FastAPI(title="Logo Background Remover API (M3 Optimized)")

# Pre-initialize the session with hardware acceleration
# CoreMLExecutionProvider: Apple Silicon (M3/M2/M1)
# CUDAExecutionProvider: NVIDIA GPUs (RTX 3050, etc.)
try:
    session = new_session("u2net", providers=[
        'CoreMLExecutionProvider', 
        'CUDAExecutionProvider', 
        'CPUExecutionProvider'
    ])
    print("AI Engine: Hardware Acceleration Active (CoreML/CUDA/CPU).")
except Exception as e:
    session = new_session("u2net")
    print(f"AI Engine: Standard CPU Mode ({e})")

# Enable CORS for frontend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Logo Background Remover API is running"}

@app.post("/remove-bg")
async def remove_background(
    file: UploadFile = File(...),
    output_format: str = Form("webp")
):
    try:
        # Read image
        input_image = await file.read()
        
        # Process the image using rembg with the optimized session
        # Using alpha_matting=True helps eliminate "white halos" and smooths the edges
        output_image = remove(
            input_image, 
            session=session,
            alpha_matting=True,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=10
        )
        
        # Convert to Pillow Image
        img = Image.open(io.BytesIO(output_image))
        
        # Optimization: Resize if image is too large
        max_size = 1200
        if max(img.size) > max_size:
            ratio = max_size / max(img.size)
            new_size = (int(img.width * ratio), int(img.height * ratio))
            img = img.resize(new_size, Image.Resampling.LANCZOS)
        
        output_format = output_format.lower()
        img_byte_arr = io.BytesIO()
        media_type = f"image/{output_format}"

        if output_format == "svg":
            if vtracer:
                # vtracer requires a file path or bytes
                # We'll save the processed image temporarily to a buffer
                tmp_buffer = io.BytesIO()
                img.save(tmp_buffer, format="PNG")
                
                # Vectorize
                # Using some reasonable defaults for logos
                svg_string = vtracer.convert_raw_image_to_svg(
                    img.size,
                    img.tobytes(),
                    img.mode,
                    colormode='color',
                    hierarchical='stacked',
                    mode='spline',
                    filter_speckle=4,
                    color_precision=6,
                    layer_difference=16,
                    corner_threshold=60,
                    length_threshold=4.0,
                    max_iterations=10,
                    splice_threshold=45,
                    path_precision=3
                )
                return Response(content=svg_string, media_type="image/svg+xml")
            else:
                raise HTTPException(status_code=500, detail="SVG conversion library not installed")

        elif output_format in ["jpg", "jpeg"]:
            # JPG doesn't support transparency, so we fill with white
            background = Image.new("RGB", img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3]) # 3 is the alpha channel
            background.save(img_byte_arr, format='JPEG', quality=90, optimize=True)
            media_type = "image/jpeg"
        
        elif output_format == "png":
            img.save(img_byte_arr, format='PNG', optimize=True)
            media_type = "image/png"
            
        elif output_format == "bmp":
            # BMP usually doesn't like alpha in some viewers, but Pillow handles it. 
            # Better to flatten for BMP or keep as is.
            img.save(img_byte_arr, format='BMP')
            media_type = "image/bmp"

        elif output_format == "tiff":
            img.save(img_byte_arr, format='TIFF')
            media_type = "image/tiff"

        elif output_format == "pdf":
            try:
                from fpdf import FPDF
                
                # Create a temporary PNG for FPDF (handles transparency better)
                tmp_png = io.BytesIO()
                img.save(tmp_png, format="PNG")
                tmp_png.seek(0)
                
                # FPDF needs dimensions in mm (approximate)
                w_mm = img.width * 0.264583
                h_mm = img.height * 0.264583
                
                pdf = FPDF(unit="mm", format=[w_mm, h_mm])
                pdf.add_page()
                pdf.image(tmp_png, x=0, y=0, w=w_mm, h=h_mm)
                
                result_bytes = pdf.output()
                media_type = "application/pdf"
            except Exception as pdf_err:
                print(f"FPDF Error: {pdf_err}")
                # Fallback to Pillow if FPDF fails
                pdf_img = img.convert("RGB")
                pdf_img.save(img_byte_arr, format='PDF')
                result_bytes = img_byte_arr.getvalue()
                media_type = "application/pdf"

        else: # Default to WEBP
            img.save(img_byte_arr, format='WEBP', quality=85, method=6)
            media_type = "image/webp"

        result_bytes = img_byte_arr.getvalue()
        print(f"Final file size ({output_format}): {len(result_bytes) / 1024:.2f} KB")
        
        return Response(
            content=result_bytes, 
            media_type=media_type,
            headers={"X-Backend-Version": "V4-MultiFormat"}
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
