import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PokemonModal from '../pokemon-modal/pokemon-modal';
import './pokemon-list.css';

const PokemonList = () => {
    const [species, setSpecies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedPokemonId, setSelectedPokemonId] = useState(null);
    const limit = 20;

    useEffect(() => {
        const fetchPokemonSpecies = async () => {
            try {
                setLoading(true);
                const offset = (currentPage - 1) * limit;
                const response = await axios.get(
                    `https://pokeapi.co/api/v2/pokemon-species?offset=${offset}&limit=${limit}`
                );

                setSpecies(response.data.results);
                setTotalCount(response.data.count);
                setTotalPages(Math.ceil(response.data.count / limit));
                setLoading(false);
            } catch (err) {
                setError('Error al cargar las especies de Pokémon');
                setLoading(false);
            }
        };

        fetchPokemonSpecies();
    }, [currentPage]);

    const getPokemonIdFromUrl = (url) => {
        const matches = url.match(/\/pokemon-species\/(\d+)\//);
        return matches ? matches[1] : null;
    };

    const handlePokemonClick = (pokemonId) => {
        setSelectedPokemonId(pokemonId);
    };

    const handleCloseModal = () => {
        setSelectedPokemonId(null);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            setSelectedPokemonId(null);
            window.scrollTo(0, 0);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            setSelectedPokemonId(null);
            window.scrollTo(0, 0);
        }
    };

    if (loading) return <div className="loading">Cargando especies de Pokémon...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="pokemon-species-list">
            <h2>Especies de Pokémon ({totalCount} total)</h2>

            <div className="pagination-info">
                Página {currentPage} de {totalPages}
            </div>

            <div className="species-grid">
                {species.map((specie, index) => {
                    const pokemonId = getPokemonIdFromUrl(specie.url);
                    return (
                        <div key={specie.name}
                             className="species-card"
                             onClick={() => pokemonId && handlePokemonClick(pokemonId)}
                             style={{ cursor: pokemonId ? 'pointer' : 'default' }}
                        >
                            <h3>{specie.name}</h3>
                            {pokemonId && (
                                <img
                                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`}
                                    alt={specie.name}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            )}
                            <p>ID: {pokemonId || 'N/A'}</p>
                            <p className="species-name">
                                {specie.name.split('-').map(word =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="pagination-controls">
                <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                >
                    ← Anterior
                </button>

                <span className="page-numbers">
          {currentPage} de {totalPages}
        </span>

                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                >
                    Siguiente →
                </button>
            </div>

            {selectedPokemonId && (
                <PokemonModal
                    pokemonId={selectedPokemonId}
                    onClose={handleCloseModal}
                    setPokemonId={setSelectedPokemonId} // ← Agrega esta línea
                />
            )}
        </div>
    );
};

export default PokemonList;