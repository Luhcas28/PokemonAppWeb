import React from 'react';
import './App.css';
import PokemonList from './components/pokemon-list/pokemon-list';

function App() {
  return (
      <div className="App">
        <header className="App-header">
          <h1>Pokédex App - Especies</h1>
          <p>Explora todas las especies de Pokémon</p>
        </header>
        <main>
          <PokemonList />
        </main>
      </div>
  );
}

export default App;