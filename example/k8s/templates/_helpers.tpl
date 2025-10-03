{{/*
Build a CSP string from either:
1) A raw string value
2) A map of directive -> slice/string
*/}}
{{- define "ingress-headers.csp" -}}
{{- $csp := . -}}
{{- if kindIs "string" $csp }}
{{- $csp | trim -}}
{{- else if kindIs "map" $csp }}
  {{- $parts := list }}
  {{- range $k := keys $csp | sortAlpha }}
    {{- $v := index $csp $k }}
    {{- if kindIs "slice" $v }}
      {{- $parts = append $parts (printf "%s %s" $k (join " " $v)) }}
    {{- else }}
      {{- $parts = append $parts (printf "%s %v" $k $v) }}
    {{- end }}
  {{- end }}
  {{- join "; " $parts -}}
{{- else }}
default-src 'self'
{{- end -}}
{{- end }}