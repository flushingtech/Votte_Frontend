import { useState } from 'react'
import IdeaList from '../components/IdeaList';

const Home = () => {
    const ideas = [
        'Build a new feature for the app',
        'Write a blog post about idea generation',
        'Create a prototype for a new product',
        'Brainstorm marketing strategies'
      ];

    return (
        <div>
            <h2>Flushing Tech Meeetup Hackathon Ideas</h2>
            <p>See the list of ideas suggested. Idea max is 10. If there's still space... add yours. Or feel free to vote.</p>
            <IdeaList ideas={ideas} />
        </div>
    )
}

export default Home;