import logo from './logo.svg';
import './App.css';
import { UserAuthContextProvider } from "./setup/UserAuthContext";
import { Routes, Route } from "react-router-dom";
import Home from './components/Home.js'
import RunningNavbar from './components/RunningNavbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import Event from './components/Events/Event';
import SignIn from './components/SignIn';
import { cleanEvents } from './setup/consts';

function App() {
  return (
    <div className="App full">
      <UserAuthContextProvider>
        <RunningNavbar />
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/login" element={<SignIn redirect_url="/events/100m-women" />} />
          {/* <Route path="/events/:event" element={<Event />} /> */}
          {cleanEvents.map((event) => (
            <Route key={event} path={`/events/${event}`} element={<Event event={event} />} />
          ))}
        </Routes>
      </UserAuthContextProvider>
    </div>
  );
}

export default App;
