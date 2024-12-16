document.addEventListener("DOMContentLoaded", function () {
    // Asegúrate de que el formulario existe antes de agregar el eventListener
    const formulario = document.getElementById("formulario");
    if (formulario) {
        formulario.addEventListener("submit", enviarFormulario);
    } else {
        console.error("Formulario no encontrado");
    }

    // Rellenar el formulario al cargar la página al pulsar el botón modificar
    const params = new URLSearchParams(window.location.search);

    if (params.has("id")) { // Si hay un id, es una cita a modificar
        document.getElementById("fecha_hora").value = params.get("fecha_hora");
        document.getElementById("nombre").value = params.get("nombre");
        document.getElementById("apellidos").value = params.get("apellidos");
        document.getElementById("dni").value = params.get("dni");
        document.getElementById("telefono").value = params.get("telefono");
        document.getElementById("fecha_nacimiento").value = params.get("fecha_nacimiento");
        document.getElementById("observaciones").value = params.get("observaciones");

        // Establecer el ID en el formulario para saber que se está modificando esta cita
        let inputId = document.getElementById("cita_id");
        if (!inputId) {
            inputId = document.createElement("input");
            inputId.type = "hidden";
            inputId.id = "cita_id";
            document.getElementById("formulario").appendChild(inputId);
        }
        inputId.value = params.get("id");
    }
});

// Enviar formulario
document.getElementById("formulario").addEventListener("submit", enviarFormulario);

function enviarFormulario(event) {
    event.preventDefault(); // Evitar que se ejecute por defecto

    const form = document.getElementById("formulario");
    if (!form) {
        console.error("Formulario no encontrado");
        return;
    }

    const datosFormulario = {
        fecha_hora: document.getElementById("fecha_hora"),
        nombre: document.getElementById("nombre"),
        apellidos: document.getElementById("apellidos"),
        dni: document.getElementById("dni"),
        telefono: document.getElementById("telefono"),
        fecha_nacimiento: document.getElementById("fecha_nacimiento"),
        observaciones: document.getElementById("observaciones"),
    };

    // Verificar si todos los campos existen
    for (const key in datosFormulario) {
        if (!datosFormulario[key]) {
            console.error(`El campo ${key} no se encuentra en el DOM.`);
            return;
        }
    }

    // Eliminar estilos previos de error
    limpiarErrores();

    // Validar el formulario
    const errores = validarFormulario(datosFormulario);
    if (errores.length > 0) {
        alert("Errores detectados:\n" + errores.join("\n"));
        return; // No continuar si hay errores
    }

    const id = document.getElementById("cita_id") ? document.getElementById("cita_id").value : generarID();

    // Crear objeto cita
    const cita = {
        id: id,
        fecha_hora: datosFormulario.fecha_hora.value,
        paciente: {
            nombre: datosFormulario.nombre.value,
            apellidos: datosFormulario.apellidos.value,
            dni: datosFormulario.dni.value,
            telefono: datosFormulario.telefono.value,
            fecha_nacimiento: datosFormulario.fecha_nacimiento.value,
        },
        observaciones: datosFormulario.observaciones.value,
    };

    // Obtener las citas de LocalStorage
    let citas = obtenerCitas();

    // Si el identificador ya existe, actualizamos los datos de la cita
    const indiceCita = citas.findIndex(c => c.id == id);
    if (indiceCita > -1) {
        citas[indiceCita] = cita; // Modificar cita
    } else {
        citas.push(cita); // Añadir nueva cita
    }

    // Guardar la cita en LocalStorage
    guardarCita(citas);

    // Notificar al usuario
    if (indiceCita > -1) {
        alert("Cita modificada con éxito.");
    } else {
        alert("Cita registrada con éxito.");
    }

    // Limpiar el formulario
    form.reset();
    // Limpiar el campo ID (en caso de ser una cita modificada)
    document.getElementById("cita_id").value = "";
}

// Generar id único en función del DNI y la fecha introducida
function generarID() {
    return `id-${Date.now()}`;
}

// Validar los datos introducidos
function validarFormulario(datos) {
    const errores = [];

    if (!validarFechaHora(datos.fecha_hora.value)) {
        errores.push("La fecha y hora introducidas no son válidas.");
        datos.fecha_hora.classList.add("error");
    }
    if (!datos.nombre.value.trim()) {
        errores.push("No se ha introducido ningún nombre.");
        datos.nombre.classList.add("error");
    }
    if (!datos.apellidos.value.trim()) {
        errores.push("No se han introducido apellidos.");
        datos.apellidos.classList.add("error");
    }
    if (!validarDNI(datos.dni.value)) {
        errores.push("El DNI introducido no es válido.");
        datos.dni.classList.add("error");
    }
    if (!/^[0-9]{9}$/.test(datos.telefono.value)) {
        errores.push("El teléfono introducido no es válido.");
        datos.telefono.classList.add("error");
    }
    if (!validarFechaNacimiento(datos.fecha_nacimiento.value)) {
        errores.push("La fecha de nacimiento introducida no es válida.");
        datos.fecha_nacimiento.classList.add("error");
    }

    return errores;
}

// Eliminar errores
function limpiarErrores() {
    document.querySelectorAll(".error").forEach((campo) => campo.classList.remove("error"));
}

// Validar el DNI introducido
function validarDNI(dni) {
    const letrasDNI = "TRWAGMYFPDXBNJZSQVHLCKE";

    // Comprobar formato del DNI introducido
    const regex = /^[0-9]{8}[A-Za-z]$/;
    if (!regex.test(dni)) {
        return false; // Formato incorrecto
    }

    // Extraer el número y la letra del DNI
    const numero = parseInt(dni.slice(0, 8), 10);
    const letra = dni.charAt(8).toUpperCase();

    // Calcular la letra según el número
    const letraCorrecta = letrasDNI[numero % 23];

    // Comparar la letra obtenida con la introducida
    return letra === letraCorrecta;
}

// Validar la fecha y la hora introducida
function validarFechaHora(fecha_hora) {
    // Convertir la fecha y hora introducidas a un onjeto Date
    const fecha_cita = new Date(fecha_hora);

    // Obtener la fecha y hora actual
    const fecha_actual = new Date();

    // Verificar que la fecha introducida es correcta
    if (isNaN(fecha_cita.getTime())) {
        return false; // Fecha no válida
    }

    // Comparar la fecha introducida y la actual
    return fecha_cita >= fecha_actual;
}

// Validar la fecha de nacimiento introducida
function validarFechaNacimiento(fecha_nacimiento) {
    // Convertir la fecha de nacimiento a un objeto Date
    const fechaNacimiento = new Date(fecha_nacimiento);
    const fecha_actual = new Date();

    // Verificar que la fecha de nacimiento introducida es válida
    if (isNaN(fechaNacimiento.getTime())) {
        return false; // Fecha no válida
    }

    // Comparar la fecha de nacimiento introducida y la actual
    return fechaNacimiento <= fecha_actual;
}

// Función para obtener citas desde LocalStorage
function obtenerCitas() {
    return JSON.parse(localStorage.getItem("citas") || "[]");
}

// Función para guardar citas en LocalStorage
function guardarCita(citas) {
    localStorage.setItem("citas", JSON.stringify(citas));
}

// Cargar los datos de una cita que se desea modificar
function cargarFormularioParaEdicion(id) {
    const citas = obtenerCitas();
    const cita = citas.find(c => c.id === id);

    if (cita) {
        document.getElementById("fecha_hora").value = cita.fecha_hora;
        document.getElementById("nombre").value = cita.paciente.nombre;
        document.getElementById("apellidos").value = cita.paciente.apellidos;
        document.getElementById("dni").value = cita.paciente.dni;
        document.getElementById("telefono").value = cita.paciente.telefono;
        document.getElementById("fecha_nacimiento").value = cita.paciente.fecha_nacimiento;
        document.getElementById("observaciones").value = cita.observaciones;
        document.getElementById("cita_id").value = cita.id;  // Establecer el ID de la cita en el campo oculto
    }
}