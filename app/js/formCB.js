window.onload = function () {
    cargarUsuarios();
};

function validarFormulario() {

    let inputUsuario = document.getElementById('selectUsuario');
    let inputBanco = document.getElementById('inputBanco');
    let inputTipoCuenta = document.getElementById('selectTipoCuenta');
    let inputNumeroCuenta = document.getElementById('inputNumeroCuenta');
    let inputMoneda = document.getElementById('selectMoneda');
    let inputSaldo = document.getElementById('inputSaldo');
    let inputFechaApertura = document.getElementById('inputFechaApertura');
    let inputSucursal = document.getElementById('inputSucursal');
    let inputTitular = document.getElementById('inputTitular');

    let formularioValido = true;

    if (!validarInput(inputUsuario)) formularioValido = false;
    if (!validarInput(inputBanco)) formularioValido = false;
    if (!validarInput(inputTipoCuenta)) formularioValido = false;
    if (!validarInput(inputNumeroCuenta)) formularioValido = false;
    if (!validarInput(inputMoneda)) formularioValido = false;
    if (!validarInput(inputSaldo)) formularioValido = false;
    if (!validarInput(inputFechaApertura)) formularioValido = false;
    if (!validarInput(inputSucursal)) formularioValido = false;
    if (!validarInput(inputTitular)) formularioValido = false;

    if (formularioValido) {

        const formulario = document.getElementById('formCuentaBancaria');
        const dataForm = new FormData(formulario);

        const datos = Object.fromEntries(dataForm.entries());

        enviarFormulario(datos);

    } else {

        alert("Debe completar todos los campos.");

    }

    const enviarFormulario = async (datos) => {
        try {
            const response = await fetch('http://localhost:3000/guardarCuentaBancaria', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });
            if (!response.ok) {
                throw new Error(`Error HTTP ${response.status}`);
            }
            const resultado = await response.json();
            console.log(resultado);
            alert("Cuenta bancaria registrada correctamente.");
        } catch (error) {
            console.error(error);
        }
    };
}

function validarInput(input) {

    return input.value !== ""
        ? inputValido(input)
        : inputInvalido(input);

}

function inputValido(input) {

    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
    return true;

}

function inputInvalido(input) {

    input.classList.remove("is-valid");
    input.classList.add("is-invalid");
    return false;

}
async function cargarUsuarios() {

    try {

        const response = await fetch('http://localhost:3000/obtenerUsuarios');

        const usuarios = await response.json();

        const select = document.getElementById("selectUsuario");

        usuarios.forEach(usuario => {

            const opcion = document.createElement("option");

            opcion.value = usuario._id;

            opcion.textContent = `${usuario.nombre} - ${usuario.rut}`;

            select.appendChild(opcion);

        });

    } catch (error) {

        console.error("Error al cargar usuarios:", error);

    }

}