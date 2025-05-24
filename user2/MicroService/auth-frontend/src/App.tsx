import RegisterPage from './pages/RegisterPage.tsx';
import LoginPage from './pages/LoginPage.tsx';

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Auth Service Demo</h1>
      <RegisterPage />
      <hr />
      <LoginPage />
    </div>
  );
}

export default App;
