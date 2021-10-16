import logo from './logo.svg';
import './App.css';
import DrawingArea from './components/canvas/DrawingArea';

function App() {
  return (
    <div className="App">
      <section className="section">
        <div className="container">
          <h1 className="title">
            Hello World
          </h1>
          <p className="subtitle">
            cloud whiteboard
          </p>
          <DrawingArea></DrawingArea>
        </div>
      </section>
    </div>
  );
}

export default App;
