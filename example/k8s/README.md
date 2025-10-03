Preview helm result: 

```bash
helm template myrel . > output/helm-output.yaml
```

Install on k8s:

```bash
helm install myrel . # name becomes <chartname>-ingress 
helm install myrel . --set ingress.name=custom-ingress # overrides name
```