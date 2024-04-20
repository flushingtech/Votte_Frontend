import { useState } from 'react';
import IdeaList from '../components/IdeaList';
import '../styles/Home.css'; // Import CSS file for styling

const Home = () => {

    return (
        <div className="home-container">
            <h2>Flushing Tech Meetup Hackathon Ideas</h2>
            <p>See the list of ideas suggested. Idea max is 10. If there's still space... add yours. Or feel free to vote.</p>
            <IdeaList />
        </div>
    )
}

export default Home;
