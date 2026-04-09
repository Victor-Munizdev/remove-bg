# 🎩 Logo Magic Remover v3.0 Ultra

[![Python](https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/OS-Apple_Silicon_M3-white?style=for-the-badge&logo=apple)](https://developer.apple.com/metal/tensorflow-plugin/)

Uma solução poderosa e local para remoção de fundos de logotipos, otimizada especificamente para o **MacBook Air M3** e dispositivos equipados com **GPUs NVIDIA RTX**. Privacidade Total, Performance de Hardware e Qualidade Profissional.

---

## ✨ Funcionalidades Avançadas

- **🚀 Aceleração de Hardware Híbrida**:
  - **Apple Silicon (M3/M2/M1)**: Utiliza `CoreML` e a Neural Engine para processamento ultra-rápido.
  - **NVIDIA CUDA**: Suporte nativo para placas como **RTX 3050** para máxima performance em Windows/Linux.
- **🛡️ Privacidade Total**: Todo o processamento ocorre localmente na sua máquina. Suas imagens nunca tocam a nuvem.
- **📸 Suporte Universal de Formatos**: Importação de **PNG, JPG, WEBP, BMP, TIFF** e suporte nativo para **HEIC (iPhone)** via `pillow-heif`.
- **📐 Vetorização SVG**: Converte logos rasterizados em vetores escaláveis (`.svg`) usando inteligência artificial.
- **📦 Multi-Exportação**: Salve como **WEBP (Ultra leve)**, **PNG (HD)**, **JPG**, **TIFF** ou **BMP**.
- **🎯 Alpha Matting**: Algoritmo de refinamento de bordas para eliminar halos brancos e serrilhados em logos complexos.
- **🏷️ Salvamento Inteligente**: Modal personalizado para renomear arquivos e detecção de hardware avançada.

---

## 🛠️ Tecnologias e Dependências

### Backend (Python)

- **FastAPI**: Servidor assíncrono de alto desempenho.
- **rembg (U2-Net)**: Modelo de segmentação de imagem de última geração.
- **ONNX Runtime Silicon/GPU**: Execução otimizada em M3 e CUDA.
- **vtracer**: Motor de vetorização para SVG.

### Frontend (React)

- **Vite**: Build system ultra-rápido.
- **Glassmorphism UI**: Design premium com efeitos de transparência e blur.
- **Hardware Sensing**: Detecção automática de SO e GPU do usuário para otimização visual.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- **Python 3.10+**: [Download aqui](https://www.python.org/downloads/)
- **Node.js (LTS)**: [Download aqui](https://nodejs.org/) (Necessário para rodar o Vite/React)

---

## ⚡ Automação (Execução Rápida)

Criei scripts que configuram o ambiente e lançam ambos os servidores de uma vez:

### 🪟 Windows

1. Dê um duplo clique no arquivo `run_windows.bat`.

### 🍎 macOS / 🐧 Linux

1. Abra o Terminal na pasta do projeto.
2. Dê permissão de execução (apenas na primeira vez): `chmod +x run_mac.sh`
3. Execute o script: `./run_mac.sh`

---

## 🚀 Como Executar Localmente

### 1. Clonar o Repositório

```bash
git clone https://github.com/Victor-Munizdev/remove-bg.git
cd remove-bg
```

### 2. Configurar o Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Configurar o Frontend

```bash
cd ../frontend
npm install
npm run dev
```

---

## ⚙️ Detecção de Dispositivo

O sistema identifica automaticamente o ambiente e aplica badges informativos:

- **macOS**: Otimizado via _Apple M3 Neural Pipeline_.
- **Windows (NVIDIA)**: Ativa _CUDA Enabled (RTX Optimized)_.

---

## 👨‍💻 Desenvolvedor

Projeto evoluído e customizado por [Victor Muniz](https://munizvr.vercel.app).

---

## 📄 Notas de Versão

- **v3.0**: Adicionada funcionalidade de Vetorização SVG.
- **v3.1**: Implementação de Alpha Matting e detecção de hardware avançada.
- **v3.2**: Refatoração de UI com Modal Premium e Ícones Vetoriais.

---

## Observações

- Este é um projeto experimental focado em logos. Caso encontre algum formato de imagem não suportado ou bugs, sinta-se à vontade para abrir um **Pull Request**!

Este projeto foi desenvolvido com foco em alta fidelidade e economia de processamento local.
