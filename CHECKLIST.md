# ✅ Checklist Pre-GitHub

## 🔒 Seguridad - CRÍTICO
- [x] `.env` está en `.gitignore`
- [x] `backend/.env` está en `.gitignore`
- [x] No hay API keys hardcodeadas en el código
- [x] Credenciales solo en archivos de entorno local
- [x] Variables de producción configuradas por separado

## 📁 Archivos de Configuración
- [x] `.env.example` creado con valores de ejemplo
- [x] `backend/.env.example` creado
- [x] `.env.production` creado para GitHub Pages
- [x] `.gitignore` actualizado y completo
- [x] `package.json` configurado para GitHub Pages
- [x] `vite.config.ts` configurado con base path

## 📚 Documentación
- [x] `README.md` completo y profesional
- [x] `LICENSE` archivo MIT creado
- [x] `DEPLOYMENT.md` guía de despliegue creada
- [x] Badges de estado añadidos
- [x] Instrucciones claras de instalación

## 🚀 Despliegue
- [x] Script `npm run deploy` configurado
- [x] GitHub Actions workflow creado
- [x] Configuración de GitHub Pages lista
- [x] Variables de entorno para producción separadas

## 🧪 Testing
- [ ] Verificar que funciona en local
- [ ] Probar build de producción
- [ ] Comprobar que fallback a mock funciona
- [ ] Verificar que no hay errores en consola

## 📝 Comandos para Subir a GitHub

```bash
# 1. Inicializar git (si no está)
git init

# 2. Añadir todos los archivos
git add .

# 3. Commit inicial
git commit -m "Initial commit: SP500 Predictor Dashboard"

# 4. Añadir remote (REEMPLAZAR CON TU URL)
git remote add origin https://github.com/tuusuario/sp500-predictor.git

# 5. Push inicial
git push -u origin main

# 6. Configurar GitHub Pages
# - Ir a Settings → Pages
# - Source: Deploy from a branch
# - Branch: gh-pages
# - Folder: / (root)

# 7. Configurar Secrets en GitHub
# - Settings → Secrets and variables → Actions
# - Añadir VITE_API_URL (URL del backend)
# - Añadir VITE_POLYGON_API_KEY (opcional)

# 8. Desplegar frontend
npm run deploy
```

## ⚠️ IMPORTANTE ANTES DE SUBIR

1. **Revisar .env**: Asegúrate de que no se sube
2. **Cambiar URLs**: Actualiza todas las referencias a "tuusuario"
3. **Probar en local**: `npm run build && npm run preview`
4. **Verificar backend**: Que funcione independientemente

## 🎯 Próximos Pasos

1. Subir a GitHub
2. Configurar GitHub Pages
3. Desplegar backend en Railway/Heroku
4. Actualizar URL del backend en producción
5. Probar funcionamiento completo
6. ¡Compartir tu proyecto!

---

**¡Todo listo para GitHub! 🚀**
