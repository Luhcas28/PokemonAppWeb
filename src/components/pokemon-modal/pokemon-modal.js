import React, {useState, useEffect} from 'react';
import axios from 'axios';
import './pokemon-modal.css';

const PokemonModal = ({pokemonId, onClose, setPokemonId}) => {
    const [pokemonData, setPokemonData] = useState(null);
    const [evolutionChain, setEvolutionChain] = useState(null);
    const [currentEvolution, setCurrentEvolution] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!pokemonId) return;

        const fetchPokemonDetails = async () => {
            try {
                setLoading(true);
                const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
                const speciesData = speciesResponse.data;
                const evolutionChainUrl = speciesData.evolution_chain.url;
                const evolutionResponse = await axios.get(evolutionChainUrl);
                const evolutionData = evolutionResponse.data;
                const parsedEvolutionChain = parseEvolutionChain(evolutionData.chain);
                setEvolutionChain(parsedEvolutionChain);
                const currentEvo = findEvolutionById(parsedEvolutionChain, parseInt(pokemonId));
                setCurrentEvolution(currentEvo);

                setPokemonData(speciesData);
                setLoading(false);
            } catch (err) {
                setError('Error al cargar los detalles del Pokémon');
                setLoading(false);
            }
        };

        fetchPokemonDetails();
    }, [pokemonId]);

    const parseEvolutionChain = (chain) => {
        const evolutionChain = [];
        let current = chain;

        while (current) {
            const speciesId = current.species.url.split('/').filter(Boolean).pop();
            evolutionChain.push({
                id: parseInt(speciesId),
                name: current.species.name,
                evolution_details: current.evolution_details || []
            });

            if (current.evolves_to && current.evolves_to.length > 0) {
                current = current.evolves_to[0];
            } else {
                current = null;
            }
        }

        return evolutionChain;
    };
    const findEvolutionById = (chain, targetId) => {
        return chain.findIndex(evo => evo.id === targetId);
    };

    const navigateEvolution = (direction) => {
        if (!evolutionChain || currentEvolution === null) return;

        if (direction === 'next' && currentEvolution < evolutionChain.length - 1) {
            const nextId = evolutionChain[currentEvolution + 1].id;
            setPokemonData(null);
            setEvolutionChain(null);
            setCurrentEvolution(null);
            setLoading(true);

            setTimeout(() => {
                window.location.hash = `pokemon-${nextId}`;
                setPokemonId(nextId);
            }, 100);
        }

        if (direction === 'prev' && currentEvolution > 0) {
            const prevId = evolutionChain[currentEvolution - 1].id;
            setPokemonData(null);
            setEvolutionChain(null);
            setCurrentEvolution(null);
            setLoading(true);

            setTimeout(() => {
                window.location.hash = `pokemon-${prevId}`;
                setPokemonId(prevId);
            }, 100);
        }
    };

    const getColorName = (color) => {
        const colors = {
            black: 'Negro',
            blue: 'Azul',
            brown: 'Marrón',
            gray: 'Gris',
            green: 'Verde',
            pink: 'Rosa',
            purple: 'Morado',
            red: 'Rojo',
            white: 'Blanco',
            yellow: 'Amarillo'
        };
        return colors[color] || color;
    };

    const getFlavorText = (flavorTextEntries) => {
        const spanishText = flavorTextEntries.find(entry =>
            entry.language.name === 'es'
        );
        const englishText = flavorTextEntries.find(entry =>
            entry.language.name === 'en'
        );
        return spanishText || englishText || flavorTextEntries[0];
    };

    const getEvolutionDetails = (details) => {
        if (!details || details.length === 0) return 'Evolución base';

        const detail = details[0];
        const conditions = [];

        if (detail.min_level) conditions.push(`Nivel ${detail.min_level}`);
        if (detail.min_happiness) conditions.push(`Felicidad ${detail.min_happiness}`);
        if (detail.min_affection) conditions.push(`Cariño ${detail.min_affection}`);
        if (detail.item) conditions.push(`Objeto: ${detail.item.name}`);
        if (detail.trigger?.name === 'trade') conditions.push('Intercambio');
        if (detail.time_of_day) conditions.push(`Por la ${detail.time_of_day}`);
        if (detail.known_move_type) conditions.push(`Movimiento tipo ${detail.known_move_type.name}`);

        return conditions.length > 0 ? conditions.join(', ') : 'Condiciones especiales';
    };

    if (!pokemonId) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>

                {loading && <div className="modal-loading">Cargando...</div>}

                {error && <div className="modal-error">{error}</div>}

                {pokemonData && (
                    <div className="pokemon-details">
                        {(evolutionChain && currentEvolution !== null) && (
                            <div className="evolution-navigation">
                                <button
                                    onClick={() => navigateEvolution('prev')}
                                    disabled={currentEvolution === 0}
                                    className="evolution-nav-btn"
                                >
                                    ← Anterior
                                </button>

                                <span className="evolution-position">
                                  {currentEvolution + 1} de {evolutionChain.length}
                                </span>

                                <button
                                    onClick={() => navigateEvolution('next')}
                                    disabled={currentEvolution === evolutionChain.length - 1}
                                    className="evolution-nav-btn"
                                >
                                    Siguiente →
                                </button>
                            </div>
                        )}

                        <div className="pokemon-header">
                            <img
                                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`}
                                alt={pokemonData.name}
                                className="pokemon-image"
                            />
                            <h2 className="pokemon-name">
                                {pokemonData.name.split('-').map(word =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                            </h2>
                            <p className="pokemon-id">#{pokemonId}</p>
                        </div>

                        {evolutionChain && (
                            <div className="info-section">
                                <h3>Cadena de Evolución</h3>
                                <div className="evolution-chain">
                                    {evolutionChain.map((evo, index) => (
                                        <div
                                            key={evo.id}
                                            className={`evolution-stage ${index === currentEvolution ? 'current' : ''}`}
                                        >
                                            <img
                                                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`}
                                                alt={evo.name}
                                                className="evolution-image"
                                            />
                                            <div className="evolution-info">
                                                <span className="evolution-name">
                                                  {evo.name.split('-').map(word =>
                                                      word.charAt(0).toUpperCase() + word.slice(1)
                                                  ).join(' ')}
                                                </span>
                                                <span className="evolution-id">#{evo.id}</span>
                                                {index > 0 && (
                                                    <span className="evolution-condition">
                                                        {getEvolutionDetails(evo.evolution_details)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pokemon-info">
                            <div className="info-section">
                                <h3>Información Básica</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Color:</span>
                                        <span className="info-value" style={{color: pokemonData.color.name}}>
                                          {getColorName(pokemonData.color.name)}
                                        </span>
                                    </div>

                                    <div className="info-item">
                                        <span className="info-label">Hábitat:</span>
                                        <span className="info-value">
                                          {pokemonData.habitat ?
                                              pokemonData.habitat.name.split('-').map(word =>
                                                  word.charAt(0).toUpperCase() + word.slice(1)
                                              ).join(' ') :
                                              'Desconocido'
                                          }
                                        </span>
                                    </div>

                                    <div className="info-item">
                                        <span className="info-label">Tasa de Captura:</span>
                                        <span className="info-value">{pokemonData.capture_rate}/255</span>
                                    </div>

                                    <div className="info-item">
                                        <span className="info-label">Felizidad Base:</span>
                                        <span className="info-value">{pokemonData.base_happiness}</span>
                                    </div>

                                    <div className="info-item">
                                        <span className="info-label">Tasa de Crecimiento:</span>
                                        <span className="info-value">
                                          {pokemonData.growth_rate.name.split('-').map(word =>
                                              word.charAt(0).toUpperCase() + word.slice(1)
                                          ).join(' ')}
                                        </span>
                                    </div>

                                    <div className="info-item">
                                        <span className="info-label">Legendario:</span>
                                        <span className="info-value">
                                          {pokemonData.is_legendary ? 'Sí' : 'No'}
                                        </span>
                                    </div>

                                    <div className="info-item">
                                        <span className="info-label">Mítico:</span>
                                        <span className="info-value">
                                          {pokemonData.is_mythical ? 'Sí' : 'No'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="info-section">
                                <h3>Descripción</h3>
                                <p className="flavor-text">
                                    {getFlavorText(pokemonData.flavor_text_entries)?.flavor_text.replace(/\f/g, ' ')}
                                </p>
                            </div>

                            <div className="info-section">
                                <h3>Generación</h3>
                                <p>
                                    {pokemonData.generation.name.split('-').map(word =>
                                        word.toUpperCase()
                                    ).join(' ')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PokemonModal;