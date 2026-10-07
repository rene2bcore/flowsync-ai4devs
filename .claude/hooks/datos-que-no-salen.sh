#!/usr/bin/env bash
# PreToolUse (Bash) — bloquea un commit si arrastra un secreto, un correo personal o un .env.
set -uo pipefail

INPUT="$(cat)"
COMMAND="$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty')"

case "$COMMAND" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
LOG_FILE="$REPO_ROOT/docs/seguridad/registro-de-bloqueos.md"

ALLOWED_EMAIL_DOMAINS="example.com example.org example.net github.com"

# Formas completas del token, no solo el prefijo — así el propio hook,
# que necesariamente menciona estos prefijos, no se autobloquea.
SECRET_PATTERNS=(
  'AKIA[A-Z0-9]{16}'
  'sk-ant-[A-Za-z0-9_-]{20,}'
  'ghp_[A-Za-z0-9]{36}'
  'github_pat_[A-Za-z0-9_]{20,}'
  'AIza[A-Za-z0-9_-]{35}'
  'xox[bpa]-[A-Za-z0-9-]{10,}'
  '-----BEGIN( [A-Z]+)? PRIVATE KEY-----'
  '^APP_KEY=.+'
)

collect_diff() {
  git -C "$REPO_ROOT" diff --cached
  case "$COMMAND" in
    *"git add"*)
      git -C "$REPO_ROOT" diff
      git -C "$REPO_ROOT" ls-files --others --exclude-standard | while IFS= read -r f; do
        printf '+++ b/%s\n' "$f"
        sed 's/^/+/' "$REPO_ROOT/$f" 2>/dev/null
      done
      ;;
  esac
}

violation_rule=""
violation_file=""
current_file="(desconocido)"

while IFS= read -r line; do
  case "$line" in
    "+++ "*)
      f="${line#+++ }"
      f="${f#b/}"
      if [[ "$f" == "/dev/null" ]]; then
        current_file="(eliminado)"
      else
        current_file="$f"
      fi
      if [[ "$(basename "$current_file")" == ".env" ]]; then
        violation_rule="Regla 3 (fichero .env)"
        violation_file="$current_file"
        break
      fi
      continue
      ;;
  esac

  case "$line" in
    "+"*) content="${line#+}" ;;
    *) continue ;;
  esac

  secret_hit=false
  for pattern in "${SECRET_PATTERNS[@]}"; do
    if [[ "$content" =~ $pattern ]]; then
      secret_hit=true
      break
    fi
  done
  if [[ "$secret_hit" == true ]]; then
    violation_rule="Regla 1 (clave con forma reconocible)"
    violation_file="$current_file"
    break
  fi

  if [[ "$content" =~ [A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,}) ]]; then
    domain_lower="$(printf '%s' "${BASH_REMATCH[1]}" | tr '[:upper:]' '[:lower:]')"
    allowed=false
    for d in $ALLOWED_EMAIL_DOMAINS; do
      [[ "$domain_lower" == "$d" ]] && { allowed=true; break; }
    done
    if [[ "$allowed" == false ]]; then
      violation_rule="Regla 2 (correo personal)"
      violation_file="$current_file"
      break
    fi
  fi
done < <(collect_diff)

if [[ -n "$violation_rule" ]]; then
  echo "BLOQUEADO: $violation_rule detectada en '$violation_file'. Sustituye el dato real por uno inventado y reintenta el commit." >&2
  mkdir -p "$(dirname "$LOG_FILE")"
  [[ -f "$LOG_FILE" ]] || printf '# Registro de bloqueos — datos-que-no-salen\n' > "$LOG_FILE"
  timestamp="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  printf '%s BLOQUEADO %s — %s\n' "$timestamp" "$violation_rule" "$violation_file" >> "$LOG_FILE"
  exit 2
fi

exit 0
