import React from 'react'
import background from "../images/background.mp4"
import '../css/Home.css'
import { LinkContainer } from 'react-router-bootstrap'

function Home() {

  return (
    <div className="home-content">
      <video autoPlay playsInline muted loop id="myVideo">
        <source src={background} type="video/mp4" />
      </video>

      <div className="intro-container">
        <div className='intro'>
          <h1 className="display-2">Crowd Sourced Track Rankings</h1>
          <p>
            View and contribute to crowd sourced elite track rankings.
            
            </p>
          <LinkContainer to="/events/100m-women">
            <button id="myBtn">Start Ranking</button>
          </LinkContainer>
          
        </div>
      </div>

    </div>
  )
}

export default Home