window.onload = function () {
    obtenerCuentas();
}

function obtenerCuentas() {

    const cargarDatos = async () => {

        try {

            const response = await fetch('http://localhost:3000/obtenerCuentasBancarias');

            const cuentas = await response.json();

            console.log(cuentas);

            new DataTable('#tablaCuentas', {

                data: cuentas,

                columns: [

                    {
                        data: 'usuarioInfo',
                        render: function (data) {
                            return data.length > 0 ? data[0].nombre : '';
                        }
                    },

                    {
                        data: 'usuarioInfo',
                        render: function (data) {
                            return data.length > 0 ? data[0].rut : '';
                        }
                    },

                    { data: 'banco' },
                    { data: 'tipoCuenta' },
                    { data: 'numeroCuenta' },
                    { data: 'moneda' },
                    { data: 'saldo' },

                    {
                        data: 'estado',
                        render: function (data) {
                            return data.charAt(0).toUpperCase() + data.slice(1);
                        }
                    },

                    { data: 'sucursal' },
                    { data: 'titular' }

                ]

            });

        } catch (err) {

            console.log('Error al obtener los datos:', err);

        }

    };

    cargarDatos();

}