const CLIENT_ID = '373992548687-vm6bjhs93mlfghh5vpfe49mmjednue.apps.googleusercontent.com';
const API_KEY = 'AIzaSyD2BB6dy7B8B3D3F-DeKbT0snnd2kdhTQ';
const SCOPES = 'https://www.googleapis.com/auth/calendar';

// Array para armazenar os agendamentos (mock para simulação)
let agendamentos = [
  { hora: '12:00 - 13:00', cliente: 'Maria C. - Design de Sobrancelhas', profissional: 'com Gabrielly Xavier' },
  { hora: '13:00 - 13:45', cliente: 'Ana S. - Design de Sobrancelhas', profissional: 'com Gabrielly Xavier', destacado: true },
  { hora: '14:00 - 14:45', cliente: 'Julia R. - Design e Pigmentação', profissional: 'com Gabrielly Xavier' },
  { hora: '15:30 - 16:00', cliente: 'Carla M. - Manutenção de Sobrancelhas', profissional: 'com Gabrielly Xavier' }
];

// Dados mockados para clientes atendidos na semana
let clientesSemana = 25; // Simulação

// Função para carregar a API do Google
function initClient() {
  gapi.load('client:auth2', () => {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      scope: SCOPES,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
    }).then(() => {
      // Verificar se o usuário está autenticado
      const authInstance = gapi.auth2.getAuthInstance();
      if (authInstance.isSignedIn.get()) {
        console.log('Usuário autenticado com sucesso!');
      } else {
        console.log('Usuário não autenticado. Clique em "Autenticar com Google".');
      }

      // Listener para o botão de autenticação
      document.getElementById('autenticar-google').addEventListener('click', () => {
        authInstance.signIn().then(() => {
          console.log('Autenticação realizada com sucesso!');
        }).catch(error => {
          console.error('Erro ao autenticar:', error);
        });
      });

      // Listener para o botão de agendar horário
      document.getElementById('botao-agendar-horario').addEventListener('click', agendarHorario);
    }).catch(error => {
      console.error('Erro ao inicializar a API do Google:', error);
    });
  });
}

// Função para renderizar os agendamentos com animação
function renderizarAgendamentos() {
  const listaAgendamentos = document.getElementById('lista-agendamentos');
  listaAgendamentos.innerHTML = '<h3>Agendamentos do Dia - 28 de Abril</h3>'; // Reset

  agendamentos.forEach(agendamento => {
    const div = document.createElement('div');
    div.className = `agendamento ${agendamento.destacado ? 'destacado' : ''}`;
    div.innerHTML = `
      <span class="hora">${agendamento.hora}</span>
      <span class="cliente">${agendamento.cliente}</span>
      <span class="profissional">${agendamento.profissional}</span>
    `;
    listaAgendamentos.appendChild(div);
  });

  atualizarDashboard();
}

// Função para atualizar o dashboard
function atualizarDashboard() {
  const totalAgendamentos = document.getElementById('total-agendamentos');
  const clientesSemanaElement = document.getElementById('clientes-semana');
  const horariosOcupados = document.getElementById('horarios-ocupados');

  totalAgendamentos.textContent = agendamentos.length;
  clientesSemanaElement.textContent = clientesSemana;

  horariosOcupados.innerHTML = ''; // Reset
  agendamentos.forEach(agendamento => {
    const li = document.createElement('li');
    li.textContent = agendamento.hora;
    horariosOcupados.appendChild(li);
  });

  // Criar gráfico de distribuição de agendamentos por horário
  const ctx = document.getElementById('grafico-agendamentos').getContext('2d');
  const horarios = agendamentos.map(a => a.hora.split(' - ')[0]); // Pegar apenas o horário de início
  const contagemHorarios = {};
  horarios.forEach(horario => {
    contagemHorarios[horario] = (contagemHorarios[horario] || 0) + 1;
  });

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(contagemHorarios),
      datasets: [{
        label: 'Agendamentos por Horário',
        data: Object.values(contagemHorarios),
        backgroundColor: '#F8BBD0', // Rosa suave
        borderColor: '#FFCA28', // Dourado brilhante
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

// Função para simular novos agendamentos (mock)
function simularNovosAgendamentos() {
  const novoAgendamento = {
    hora: '16:30 - 17:00',
    cliente: 'Fernanda L. - Design de Sobrancelhas',
    profissional: 'com Gabrielly Xavier'
  };
  agendamentos.push(novoAgendamento);
  clientesSemana += 1; // Simular incremento de clientes
  renderizarAgendamentos();
}

// Função para agendar um horário e criar evento no Google Calendar
function agendarHorario() {
  const nomeCliente = document.getElementById('nome-cliente').value;
  const dataHorario = document.getElementById('data-horario').value;
  const servico = document.getElementById('servico').value;

  if (!nomeCliente || !dataHorario || !servico) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  const dataInicio = new Date(dataHorario);
  const dataFim = new Date(dataInicio.getTime() + 45 * 60 * 1000); // 45 minutos depois

  // Adicionar ao array de agendamentos
  const novoAgendamento = {
    hora: `${dataInicio.getHours()}:${dataInicio.getMinutes().toString().padStart(2, '0')} - ${dataFim.getHours()}:${dataFim.getMinutes().toString().padStart(2, '0')}`,
    cliente: `${nomeCliente} - ${servico}`,
    profissional: 'com Gabrielly Xavier'
  };
  agendamentos.push(novoAgendamento);
  clientesSemana += 1; // Incrementar clientes da semana
  renderizarAgendamentos();

  // Criar evento no Google Calendar
  if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
    const event = {
      summary: `${servico} - ${nomeCliente}`,
      description: `Agendamento com Gabrielly Xavier`,
      start: {
        dateTime: dataInicio.toISOString(),
        timeZone: 'America/Sao_Paulo'
      },
      end: {
        dateTime: dataFim.toISOString(),
        timeZone: 'America/Sao_Paulo'
      }
    };

    gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event
    }).then(response => {
      alert('Horário agendado e adicionado ao Google Calendar com sucesso!');
    }).catch(error => {
      console.error('Erro ao criar evento no Google Calendar:', error);
      alert('Erro ao agendar no Google Calendar. Verifique o console para mais detalhes.');
    });
  } else {
    alert('Por favor, autentique com o Google antes de agendar.');
  }
}

// Inicializar a agenda e configurar atualização automática
document.addEventListener('DOMContentLoaded', () => {
  initClient();
  renderizarAgendamentos();
  setInterval(simularNovosAgendamentos, 300000); // Atualiza a cada 5 minutos
});
