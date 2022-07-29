import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { LinkContainer } from 'react-router-bootstrap'
import { useUserAuth } from '../setup/UserAuthContext';
import '../css/Navbar.css'
import { events } from '../setup/consts';
import { useState } from 'react';

function RunningNavbar() {

    const expand = false

    const { user, logOut } = useUserAuth()

    for (let i in events) {
        events[i] = cleanSlashes(events[i])
    }

    const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

    return (

        <Navbar bg="light" expand={expand} sticky="top">
            <Container fluid>

                {/* Brand */}
                <LinkContainer to='/'>
                    <Navbar.Brand>Running Ranks</Navbar.Brand>
                </LinkContainer>

                {/* Other options */}
                <div className="right-align-nav">

                    <LinkContainer to='/'>
                        <Nav.Link>Home</Nav.Link>
                    </LinkContainer>


                    {user != null &&
                        <Nav.Link onClick={logOut}>Sign Out</Nav.Link>
                    }

                    {user == null &&
                        <LinkContainer to='/login'>
                            <Nav.Link>Log In</Nav.Link>
                        </LinkContainer>
                    }





                    {/* Events */}
                    <Navbar.Toggle aria-controls={`offcanvasNavbar-expand`} onClick={handleShow} />
                    <Navbar.Offcanvas
                        id={`offcanvasNavbar-expand`}
                        // aria-labelledby={`offcanvasNavbarLabel-expand`}
                        placement="end"
                        show={show}
                        onHide={handleClose}
                    >
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title id={`offcanvasNavbarLabel}`}>
                                Events
                            </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <Nav className="justify-content-end flex-grow-1 pe-3">

                                {events.map((event) => (
                                    <LinkContainer 
                                        key={event} 
                                        to={`events/${event}`}
                                        onClick={handleClose}
                                        
                                    >
                                        <Nav.Link>
                                        
                                            {cleanDashes(event)}
                                            
                                        </Nav.Link>
                                    </LinkContainer>
                                ))}
                            </Nav>
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>
                </div>






            </Container>
        </Navbar>

    );
}

export default RunningNavbar;


function cleanSlashes(str) {
    return str.replace('/', '-')
}

function cleanDashes(str) {
    return str.replace('-', ' ')
}