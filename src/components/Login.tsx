import axios from "axios";
import { useState } from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from "@mui/material/Grid";
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

interface LoginProps {
  onLoginSuccess: () => void;
  setLoggedInUser: (user: { username: string, rank: string } | null) => void;
  darkMode: boolean;
}

function Auth({ onLoginSuccess, setLoggedInUser, darkMode }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      secondary: {
        main: 'rgb(68, 183, 0, 0.4)',
      },
    },
  });  

  const handleClose = () => {
    setIsRegistering(false);
  };

  const handleLogin = () => {
    axios.post('http://localhost:3001/login', { username, password })
      .then(response => {
        const token = response.data.token;
        localStorage.setItem('token', token);
        
        GetUserRole();
        onLoginSuccess();
      })
      .catch(error => {
        console.error("Authentication failed", error);
        if (!username || !password) {
          displayError("Please enter both username and password.");
        } else {
          displayError("Invalid username or password.");
        }
      });
  };
  
  const handleRegister = () => {
    if (!username.trim() || !password.trim()) {
      displayError("Username and password cannot be blank.");
      return;
    }
  
    axios.post('http://localhost:3001/register', { username, password, role: 'User' })
      .then(response => {
        console.log("Registration successful");
        setIsRegistering(false);
      })
      .catch(error => {
        console.error("Registration failed", error);
        displayError("Username is already taken.");
      });
  };
  
  const displayError = (message: string) => {
    setErrorMsg(message);
    
    setTimeout(() => {
      setErrorMsg(null);
    }, 5000);
  };  

  const GetUserRole = () => {
    axios.get('http://localhost:3001/getUserRole', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(response => {
      const role = response.data.role;
      console.log("User role is:", role);
      setLoggedInUser({ username, rank: role });
    })
    .catch(error => {
      console.error("Failed to get user role", error);
    });
  }  

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Dialog open={!isRegistering} onClose={handleClose}>
        <DialogTitle>Login</DialogTitle>
        <DialogContent>
          {errorMsg && <div style={{ color: 'red' }}>{errorMsg}</div>}
          <DialogContentText>
            Enter your credentials to login.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            type="text"
            fullWidth
            variant="standard"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="standard"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Grid
            container
            direction="row-reverse"
            justifyContent="space-between"
            alignItems="center"
          >
            <Button onClick={handleLogin}>Login</Button>
            <Button onClick={() => setIsRegistering(true)}>Register</Button>
          </Grid>
        </DialogActions>
      </Dialog>

      <Dialog open={isRegistering} onClose={handleClose}>
        <DialogTitle>Register</DialogTitle>
        <DialogContent>
          {errorMsg && <div style={{ color: 'red' }}>{errorMsg}</div>}
          <DialogContentText>
            Enter your desired credentials to register.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            type="text"
            fullWidth
            variant="standard"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="standard"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Grid
            container
            direction="row-reverse"
            justifyContent="space-between"
            alignItems="center"
          >
            <Button onClick={handleRegister}>Register</Button>
            <Button onClick={() => setIsRegistering(false)}>Back</Button>
          </Grid>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

export default Auth;
