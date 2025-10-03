{{/*
Build a string from either:
1) A raw string value
2) A map of directive -> slice/string
*/}}
{{- define "nested-headers" -}}
{{- $nested := . -}}
{{- if kindIs "string" $nested }}
{{- $nested | trim -}}
{{- else if kindIs "map" $nested }}
  {{- $parts := list }}
  {{- range $k := keys $nested | sortAlpha }}
    {{- $v := index $nested $k }}
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

{{/*
Same as nested-headers but preserves the map's natural (non-deterministic) order.
*/}}
{{- define "nested-headers-unsorted" -}}
{{- $nested := . -}}
{{- if kindIs "string" $nested }}
{{- $nested | trim -}}
{{- else if kindIs "map" $nested }}
  {{- $parts := list }}
  {{- range $k := keys $nested }}
    {{- $v := index $nested $k }}
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