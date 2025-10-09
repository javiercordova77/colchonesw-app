#!/usr/bin/env bash
set -euo pipefail

IP_DEFAULT="192.168.10.104"
DAYS_SERVER=365
DAYS_CA=730
SAN_CNF="san.cnf"

echo "=== Renovación Certificado Desarrollo ==="
cd "$(dirname "$0")"

# 1. Verifica san.cnf
if [[ ! -f "$SAN_CNF" ]]; then
  cat > "$SAN_CNF" <<EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
CN = ${IP_DEFAULT}

[v3_req]
subjectAltName = @alt_names

[alt_names]
IP.1 = ${IP_DEFAULT}
EOF
  echo "[+] san.cnf creado con IP ${IP_DEFAULT}"
fi

# 2. Pregunta IP (Enter = mantener)
read -rp "IP para el certificado [${IP_DEFAULT}]: " IP_INPUT
IP="${IP_INPUT:-$IP_DEFAULT}"

# 3. Actualiza san.cnf si la IP cambió
if ! grep -q "$IP" san.cnf; then
  sed -i.bak "s/${IP_DEFAULT}/${IP}/g" san.cnf || true
  echo "[+] san.cnf actualizado a IP ${IP}"
fi

# 4. Crear CA si no existe
if [[ ! -f ca.key || ! -f ca.crt ]]; then
  echo "[+] Creando CA raíz (válida ${DAYS_CA} días)..."
  openssl genrsa -out ca.key 4096
  openssl req -x509 -new -nodes -key ca.key -sha256 -days ${DAYS_CA} -out ca.crt -subj "/CN=ColchonesW-Dev-CA"
  echo "[+] CA creada (ca.crt / ca.key)"
else
  echo "[=] CA existente reutilizada."
fi

# 5. Generar clave servidor
echo "[+] Generando clave servidor..."
openssl genrsa -out keyXentra.pem 2048

# 6. CSR
echo "[+] Generando CSR..."
openssl req -new -key keyXentra.pem -out server.csr -config san.cnf

# 7. Firmar con CA
echo "[+] Firmando certificado servidor (${DAYS_SERVER} días)..."
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out certXentra.pem -days ${DAYS_SERVER} -sha256 -extensions v3_req -extfile san.cnf

# 8. Limpieza
rm -f server.csr ca.srl 2>/dev/null || true

# 9. Exportar CA para instalar en dispositivos
cp ca.crt ColchonesW-Dev-CA.cer

# 10. Mostrar info
echo "=== Resumen ==="
openssl x509 -in certXentra.pem -noout -subject -issuer -dates
echo
echo "Huella SHA256:"
openssl x509 -in certXentra.pem -noout -fingerprint -sha256
echo
echo "[!] Copia / instala ColchonesW-Dev-CA.cer en Mac e iPhone si cambiaste IP o regeneraste la CA."
echo "[!] Usa keyXentra.pem + certXentra.pem en backend (3001) y frontend (5174)."
echo "[+] Listo."