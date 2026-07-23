#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "==> [1/4] Gerando DOCX dos 4 curriculos..."
python3 run.py gerar output/curriculo_fullstack_en.md output/Resume_Afonso_FullStack.docx
python3 run.py gerar output/curriculo_fullstack_ptbr.md output/CV_Afonso_FullStack.docx
python3 run.py gerar output/curriculo_mobile_en.md output/Resume_Afonso_Mobile.docx
python3 run.py gerar output/curriculo_mobile_ptbr.md output/CV_Afonso_Mobile.docx

echo "==> [2/4] Convertendo para PDF (se LibreOffice disponivel)..."
SOFFICE="$(command -v soffice || true)"
[ -z "$SOFFICE" ] && [ -x /Applications/LibreOffice.app/Contents/MacOS/soffice ] && SOFFICE=/Applications/LibreOffice.app/Contents/MacOS/soffice
if [ -n "$SOFFICE" ]; then
  "$SOFFICE" --headless --convert-to pdf --outdir output/ \
    output/Resume_Afonso_FullStack.docx output/CV_Afonso_FullStack.docx \
    output/Resume_Afonso_Mobile.docx output/CV_Afonso_Mobile.docx
else
  echo "    LibreOffice nao encontrado — converta os .docx para PDF no Word/Pages."
fi

echo "==> [3/4] Atualizando config.yml do perfil GitHub (dispara workflow dos SVGs)..."
SHA=$(gh api repos/afonsoburginski/afonsoburginski/contents/config.yml --jq .sha)
CONTENT=$(base64 < github-profile-config.yml | tr -d '\n')
gh api -X PUT repos/afonsoburginski/afonsoburginski/contents/config.yml \
  -f message="chore: update profile — Atman Systems, streaming & distributed systems, 7y" \
  -f sha="$SHA" \
  -f content="$CONTENT" > /dev/null
echo "    config.yml publicado."

echo "==> [4/4] Atualizando bio/company do GitHub..."
gh api -X PATCH /user \
  -f bio="Senior Software Engineer · Video Streaming & Distributed Systems | Founder of Stormz+" \
  -f company="Atman Systems" > /dev/null
echo "    Bio atualizada."

echo "==> Concluido."
