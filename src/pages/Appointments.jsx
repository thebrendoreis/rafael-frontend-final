import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';
import api from '../services/api';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appRes, cliRes, barRes, serRes] = await Promise.all([
        api.get('/appointments').catch(() => ({ data: [] })),
        api.get('/clients').catch(() => ({ data: [] })),
        api.get('/barbers').catch(() => ({ data: [] })),
        api.get('/services').catch(() => ({ data: [] }))
      ]);
      setAppointments(appRes.data);
      setClients(cliRes.data);
      setBarbers(barRes.data);
      setServices(serRes.data);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const getStatusColor = (status) => {
    switch(status) {
      case 'CONFIRMED': return 'primary';
      case 'PENDING': return 'warning';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Agendamentos
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpen}>
          Novo Agendamento
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data e Hora</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Serviço</TableCell>
              <TableCell>Barbeiro</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Nenhum agendamento encontrado.</TableCell>
              </TableRow>
            ) : appointments.map((row) => (
              <TableRow key={row.appointment_id} hover>
                <TableCell>{row.appointmentDateTime ? format(new Date(row.appointmentDateTime), 'dd/MM/yyyy HH:mm') : ''}</TableCell>
                <TableCell>{row.clientName || row.client_id}</TableCell>
                <TableCell>{row.serviceName || row.service_id}</TableCell>
                <TableCell>{row.barberName || row.barber_id}</TableCell>
                <TableCell>
                  <Chip label={row.status} color={getStatusColor(row.status)} size="small" />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" sx={{ color: 'primary.main' }}>Editar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 'bold' }}>Novo Agendamento</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Cliente" select fullWidth defaultValue="">
              {clients.map(c => <MenuItem key={c.id} value={c.id}>{c.fullName}</MenuItem>)}
            </TextField>
            <TextField label="Barbeiro" select fullWidth defaultValue="">
              {barbers.map(b => <MenuItem key={b.id} value={b.id}>{b.fullName}</MenuItem>)}
            </TextField>
            <TextField label="Serviço" select fullWidth defaultValue="">
              {services.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </TextField>
            <TextField 
              label="Data e Hora" 
              type="datetime-local" 
              fullWidth 
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">Cancelar</Button>
          <Button onClick={handleClose} variant="contained" color="primary">Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
