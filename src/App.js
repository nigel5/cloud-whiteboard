import logo from './logo.svg';
import './App.css';
import DrawingArea from './components/canvas/DrawingArea';
import BrushSelector from './components/canvas/BrushSelector';

function App() {
  return (
    <>
    <div>
      <DrawingArea></DrawingArea>
    </div>
    <BrushSelector></BrushSelector>
    </>
  );
}

export default App;
