import { useState } from 'react'
import IdeaList from '../components/IdeaList';

const Home = () => {
    const initialIdeas = [
        { text: 'Build a new feature for the app', id: 1 },
        { text: 'Write a blog post about idea generation', id: 2 },
        { text: 'Create a prototype for a new product', id: 3 },
        { text: 'Brainstorm marketing strategies', id: 4 }
      ];

    return (
        <div>
            <h2>Flushing Tech Meeetup Hackathon Ideas</h2>
            <p>See the list of ideas suggested. Idea max is 10. If there's still space... add yours. Or feel free to vote.</p>
            <IdeaList />
        </div>
    )
}

export default Home;