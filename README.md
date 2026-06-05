# ⚡ LogicBoard - Simulador Interactivos del Álgebra de Boole

LogicBoard es un simulador web moderno y elegante para circuitos de álgebra booleana. Diseñado para representar circuitos académicos de manera profesional, intuitiva y sumamente interactiva, permitiendo armar redes lógicas complejas con compuertas estándar en cuestión de segundos.

---

## ✨ Características Principales

### 🛸 Compuertas con Gráficos Vectoriales (SVG)
Se acabaron las cajas genéricas. Las compuertas están modeladas de acuerdo con la simbología estándar de la lógica de circuitos:
* **Compuerta AND:** Estilo clásico plano-semicircular en forma de "D".
* **Compuerta OR:** Diseño curvo terminado en una punta afinada hacia la derecha.
* **Compuerta NOT (Inversor):** Triángulo apuntando a la derecha con su respectivo círculo burbuja en el extremo de salida.
* **Entradas/Salidas Toggles:** Círculos estilizados interactivos para alternar bits (`1`/`0`) e indicadores de salida (`ON`/`OFF`) que emiten un brillo animado cuando reciben señal positiva.

### 🔌 Conexiones Inteligentes Clic-a-Clic (Click-to-Connect)
* **Conexión Directa:** Haz un solo clic sobre cualquier pin blanco de salida o entrada, y la línea punteada seguirá libremente tu cursor. Haz clic en el pin de destino de otra compuerta para realizar la conexión.
* **Cancelación de Línea:** Cancela el trazado de forma sencilla haciendo clic en cualquier parte vacía de la cuadrícula.
* **Brillo de Destino Válido:** Al trazar, los pines compatibles en otras compuertas brillarán con un haz verde intermitente.
* **Límites de Entrada Académicos:** Protege el diseño lógico limitando conexiones (ej. máximo 2 entradas en compuertas AND/OR, 1 en NOT/Outputs).

### 🛠️ Interacciones de Tablero Premium
* **Arrastre Físico 1:1:** Implementa un sistema de arrastre libre de saltos que sincroniza las coordenadas en pantalla con las del estado al 100%, evitando el desfase de los cables.
* **Eliminación Individual de Cables:** Los cables reaccionan al pasar el cursor encima iluminándose en color rojo. Haz clic en un cable para borrar la conexión al instante.
* **Edición de Etiquetas sin Bloqueos:** Haz clic sobre la etiqueta de texto de cualquier nodo para modificar su nombre (ej. variables como `x`, `y`, `z`). Al editar, se bloquea el arrastre del nodo y se selecciona el texto automáticamente para escribir con total facilidad.
* **Propagación Síncrona Instantánea:** Evalúa el circuito lógica de forma recursiva hasta 10 niveles de profundidad de forma instantánea al alternar cualquier interruptor, evitando retrasos en la cascada de señales.

---

## 🚀 Tecnologías Utilizadas

El simulador está optimizado para ser ultra liviano, utilizando:
* **Core:** React 19 + TypeScript.
* **Bundler & Dev Server:** Vite 8.
* **Estilos & Diseño:** Tailwind CSS (versión v4).
* **Animaciones:** Motion (Framer Motion) para animaciones de entrada.
* **Iconografía:** Lucide React.

---

## 💻 Instrucciones de Instalación y Ejecución

### Requisitos Previos
* Tener instalado **Node.js** (versión 18 o superior recomendada).

### Paso 1: Instalar Dependencias
Abre la consola en el directorio raíz del proyecto y ejecuta:
```bash
npm install
```

### Paso 2: Levantar el Servidor de Desarrollo
Para correr la aplicación de forma local:
```bash
npm run dev
```
La consola te proveerá la URL local (normalmente `http://localhost:5173` o similar) para abrir en tu navegador.

### Paso 3: Construir para Producción
Si deseas compilar la aplicación para desplegarla en un entorno web:
```bash
npm run build
```
Esto generará los archivos optimizados dentro del directorio `/dist`.

---

## 📖 Guía de Simulación (Ejemplo Académico)

Para armar el circuito clásico que produce la salida **`xy` + `x̄y`**:
1. Agrega **2 Entradas** desde el menú lateral y renómbralas a `x` e `y` haciendo clic en su etiqueta superior.
2. Agrega una compuerta **AND**, una **OR** y un **NOT**.
3. Agrega una compuerta **AND** adicional.
4. Conecta:
   * La entrada `x` al pin de entrada del **NOT**.
   * La salida del **NOT** al primer pin del segundo **AND**.
   * La entrada `y` al segundo pin del segundo **AND** (ahora tienes `x̄y`).
   * La entrada `x` original al primer pin del primer **AND**.
   * La entrada `y` original al segundo pin del primer **AND** (ahora tienes `xy`).
   * Las salidas de ambos **AND** a los dos pines del **OR**.
5. Agrega una **Salida** (`Output`) y conéctala a la salida del **OR**.
6. ¡Interactúa! Haz clic en los interruptores `1`/`0` de tus entradas y observa cómo fluyen las señales en verde a través del circuito en tiempo real.
