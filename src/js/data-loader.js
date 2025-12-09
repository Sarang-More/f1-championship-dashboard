/**
 * F1 DATA LOADER MODULE
 * Handles loading and processing of all F1 dataset files
 */

const DataLoader = {
    // Data storage
    data: {
        races: [],
        drivers: [],
        constructors: [],
        results: [],
        driverStandings: [],
        constructorStandings: [],
        circuits: [],
        qualifying: [],
        pitStops: [],
        lapTimes: [],
        seasons: [],
        status: []
    },

    // Lookup maps for fast access
    maps: {
        drivers: new Map(),
        constructors: new Map(),
        races: new Map(),
        circuits: new Map()
    },

    // Data paths (relative to index.html in src folder)
    paths: {
        races: 'data/races.csv',
        drivers: 'data/drivers.csv',
        constructors: 'data/constructors.csv',
        results: 'data/results.csv',
        driverStandings: 'data/driver_standings.csv',
        constructorStandings: 'data/constructor_standings.csv',
        circuits: 'data/circuits.csv',
        qualifying: 'data/qualifying.csv',
        pitStops: 'data/pit_stops.csv',
        lapTimes: 'data/lap_times.csv',
        seasons: 'data/seasons.csv',
        status: 'data/status.csv'
    },

    // Status callback
    onStatusUpdate: null,

    /**
     * Load all data files
     */
    async loadAll(statusCallback) {
        this.onStatusUpdate = statusCallback;
        
        console.log('🏎️ Starting F1 data load...');
        this.updateStatus('Loading race data...');

        try {
            // Load in sequence for status updates
            await this.loadFile('races');
            await this.loadFile('drivers');
            await this.loadFile('constructors');
            await this.loadFile('results');
            await this.loadFile('circuits');
            await this.loadFile('driverStandings');
            await this.loadFile('constructorStandings');
            await this.loadFile('qualifying');
            await this.loadFile('pitStops');
            await this.loadFile('status');
            
            this.updateStatus('Processing data...');
            this.processData();
            
            this.updateStatus('Creating lookup maps...');
            this.createMaps();

            this.updateStatus('Ready!');
            console.log('✅ All data loaded successfully!');
            
            return true;
        } catch (error) {
            console.error('❌ Error loading data:', error);
            this.updateStatus('Error loading data');
            return false;
        }
    },

    /**
     * Load a single file
     */
    async loadFile(key) {
        try {
            const data = await d3.csv(this.paths[key]);
            this.data[key] = data;
            console.log(`✓ Loaded ${key}: ${data.length} records`);
            this.updateStatus(`Loaded ${key}...`);
        } catch (error) {
            console.warn(`⚠️ Could not load ${key}:`, error);
            this.data[key] = [];
        }
    },

    /**
     * Update status display
     */
    updateStatus(message) {
        if (this.onStatusUpdate) {
            this.onStatusUpdate(message);
        }
    },

    /**
     * Process and clean the data
     */
    processData() {
        // Process races
        this.data.races.forEach(r => {
            r.raceId = +r.raceId;
            r.year = +r.year;
            r.round = +r.round;
            r.circuitId = +r.circuitId;
        });

        // Process drivers
        this.data.drivers.forEach(d => {
            d.driverId = +d.driverId;
            d.fullName = `${d.forename} ${d.surname}`;
        });

        // Process constructors
        this.data.constructors.forEach(c => {
            c.constructorId = +c.constructorId;
        });

        // Process results
        this.data.results.forEach(r => {
            r.resultId = +r.resultId;
            r.raceId = +r.raceId;
            r.driverId = +r.driverId;
            r.constructorId = +r.constructorId;
            r.grid = +r.grid;
            r.position = r.position === '\\N' ? null : +r.position;
            r.positionOrder = +r.positionOrder;
            r.points = +r.points;
            r.laps = +r.laps;
        });

        // Process circuits
        this.data.circuits.forEach(c => {
            c.circuitId = +c.circuitId;
            c.lat = +c.lat;
            c.lng = +c.lng;
        });

        // Process driver standings
        this.data.driverStandings.forEach(s => {
            s.driverStandingsId = +s.driverStandingsId;
            s.raceId = +s.raceId;
            s.driverId = +s.driverId;
            s.points = +s.points;
            s.position = +s.position;
            s.wins = +s.wins;
        });

        // Process constructor standings
        this.data.constructorStandings.forEach(s => {
            s.constructorStandingsId = +s.constructorStandingsId;
            s.raceId = +s.raceId;
            s.constructorId = +s.constructorId;
            s.points = +s.points;
            s.position = +s.position;
            s.wins = +s.wins;
        });

        // Process qualifying
        this.data.qualifying.forEach(q => {
            q.qualifyId = +q.qualifyId;
            q.raceId = +q.raceId;
            q.driverId = +q.driverId;
            q.constructorId = +q.constructorId;
            q.position = +q.position;
        });

        // Process pit stops
        this.data.pitStops.forEach(p => {
            p.raceId = +p.raceId;
            p.driverId = +p.driverId;
            p.stop = +p.stop;
            p.lap = +p.lap;
            p.milliseconds = +p.milliseconds;
        });

        console.log('✓ Data processing complete');
    },

    /**
     * Create lookup maps for fast access
     */
    createMaps() {
        // Driver map
        this.maps.drivers = new Map(
            this.data.drivers.map(d => [d.driverId, d])
        );

        // Constructor map
        this.maps.constructors = new Map(
            this.data.constructors.map(c => [c.constructorId, c])
        );

        // Race map
        this.maps.races = new Map(
            this.data.races.map(r => [r.raceId, r])
        );

        // Circuit map
        this.maps.circuits = new Map(
            this.data.circuits.map(c => [c.circuitId, c])
        );

        console.log('✓ Lookup maps created');
    },

    /**
     * Get unique seasons
     */
    getSeasons() {
        return [...new Set(this.data.races.map(r => r.year))].sort((a, b) => b - a);
    },

    /**
     * Get races for a specific season
     */
    getRacesBySeason(year) {
        return this.data.races
            .filter(r => r.year === year)
            .sort((a, b) => a.round - b.round);
    },

    /**
     * Get results for a race
     */
    getResultsByRace(raceId) {
        return this.data.results
            .filter(r => r.raceId === raceId)
            .sort((a, b) => a.positionOrder - b.positionOrder);
    },

    /**
     * Get driver standings for a season
     */
    getDriverStandings(year) {
        const seasonRaces = this.getRacesBySeason(year);
        if (seasonRaces.length === 0) return [];

        const lastRace = seasonRaces[seasonRaces.length - 1];
        return this.data.driverStandings
            .filter(s => s.raceId === lastRace.raceId)
            .sort((a, b) => a.position - b.position)
            .map(s => ({
                ...s,
                driver: this.maps.drivers.get(s.driverId)
            }));
    },

    /**
     * Get constructor standings for a season
     */
    getConstructorStandings(year) {
        const seasonRaces = this.getRacesBySeason(year);
        if (seasonRaces.length === 0) return [];

        const lastRace = seasonRaces[seasonRaces.length - 1];
        return this.data.constructorStandings
            .filter(s => s.raceId === lastRace.raceId)
            .sort((a, b) => a.position - b.position)
            .map(s => ({
                ...s,
                constructor: this.maps.constructors.get(s.constructorId)
            }));
    },

    /**
     * Get championship progression (points over races)
     */
    getChampionshipProgression(year, type = 'drivers') {
        const seasonRaces = this.getRacesBySeason(year);
        const standings = type === 'drivers' ? this.data.driverStandings : this.data.constructorStandings;
        const entityMap = type === 'drivers' ? this.maps.drivers : this.maps.constructors;
        const idField = type === 'drivers' ? 'driverId' : 'constructorId';

        // Get unique entities for the season
        const raceIds = new Set(seasonRaces.map(r => r.raceId));
        const seasonStandings = standings.filter(s => raceIds.has(s.raceId));
        
        const entities = [...new Set(seasonStandings.map(s => s[idField]))];
        
        // Build progression data
        const progression = entities.map(entityId => {
            const entity = entityMap.get(entityId);
            const points = seasonRaces.map(race => {
                const standing = seasonStandings.find(
                    s => s.raceId === race.raceId && s[idField] === entityId
                );
                return {
                    round: race.round,
                    raceName: race.name,
                    points: standing ? standing.points : 0
                };
            });

            return {
                id: entityId,
                name: type === 'drivers' ? entity?.fullName : entity?.name,
                color: this.getEntityColor(entityId, type),
                points: points
            };
        });

        // Sort by final points
        return progression
            .filter(p => p.points.length > 0 && p.points[p.points.length - 1].points > 0)
            .sort((a, b) => {
                const aFinal = a.points[a.points.length - 1]?.points || 0;
                const bFinal = b.points[b.points.length - 1]?.points || 0;
                return bFinal - aFinal;
            })
            .slice(0, 10); // Top 10
    },

    /**
     * Get all-time statistics - returns ALL drivers sorted by metric
     */
    getAllTimeStats(metric = 'wins', limit = null) {
        const driverStats = new Map();

        this.data.results.forEach(result => {
            const driverId = result.driverId;
            if (!driverStats.has(driverId)) {
                const driver = this.maps.drivers.get(driverId);
                driverStats.set(driverId, {
                    driverId,
                    name: driver?.fullName || 'Unknown',
                    wins: 0,
                    podiums: 0,
                    poles: 0,
                    points: 0,
                    races: 0
                });
            }

            const stats = driverStats.get(driverId);
            stats.races++;
            stats.points += result.points;
            
            if (result.position === 1) stats.wins++;
            if (result.position && result.position <= 3) stats.podiums++;
            if (result.grid === 1) stats.poles++;
        });

        let result = [...driverStats.values()]
            .sort((a, b) => b[metric] - a[metric]);
        
        // Only apply limit if specified
        if (limit) {
            result = result.slice(0, limit);
        }
        
        return result;
    },

    /**
     * Get race winners for a season
     */
    getRaceWinners(year) {
        const races = this.getRacesBySeason(year);
        return races.map(race => {
            const winner = this.data.results.find(
                r => r.raceId === race.raceId && r.position === 1
            );
            const driver = winner ? this.maps.drivers.get(winner.driverId) : null;
            const constructor = winner ? this.maps.constructors.get(winner.constructorId) : null;

            return {
                race: race.name,
                round: race.round,
                driver: driver?.fullName || 'Unknown',
                constructor: constructor?.name || 'Unknown',
                driverId: winner?.driverId
            };
        });
    },

    /**
     * Get constructor dominance data
     */
    getConstructorDominance() {
        const decades = [
            { name: '1950s', start: 1950, end: 1959 },
            { name: '1960s', start: 1960, end: 1969 },
            { name: '1970s', start: 1970, end: 1979 },
            { name: '1980s', start: 1980, end: 1989 },
            { name: '1990s', start: 1990, end: 1999 },
            { name: '2000s', start: 2000, end: 2009 },
            { name: '2010s', start: 2010, end: 2019 },
            { name: '2020s', start: 2020, end: 2024 }
        ];

        return decades.map(decade => {
            const wins = {};
            
            this.data.results
                .filter(r => {
                    const race = this.maps.races.get(r.raceId);
                    return race && race.year >= decade.start && race.year <= decade.end && r.position === 1;
                })
                .forEach(r => {
                    const constructor = this.maps.constructors.get(r.constructorId);
                    const name = constructor?.name || 'Other';
                    wins[name] = (wins[name] || 0) + 1;
                });

            return {
                decade: decade.name,
                ...wins
            };
        });
    },

    /**
     * Get circuit statistics
     */
    getCircuitStats() {
        return this.data.circuits.map(circuit => {
            const races = this.data.races.filter(r => r.circuitId === circuit.circuitId);
            const raceIds = new Set(races.map(r => r.raceId));
            
            const winners = this.data.results
                .filter(r => raceIds.has(r.raceId) && r.position === 1)
                .map(r => this.maps.drivers.get(r.driverId)?.fullName);
            
            const uniqueWinners = [...new Set(winners)];

            return {
                ...circuit,
                totalRaces: races.length,
                uniqueWinners: uniqueWinners.length,
                mostWins: this.getMostWinsAtCircuit(raceIds)
            };
        }).filter(c => c.totalRaces > 0);
    },

    /**
     * Get driver with most wins at a circuit
     */
    getMostWinsAtCircuit(raceIds) {
        const winCount = {};
        
        this.data.results
            .filter(r => raceIds.has(r.raceId) && r.position === 1)
            .forEach(r => {
                winCount[r.driverId] = (winCount[r.driverId] || 0) + 1;
            });

        const topDriverId = Object.entries(winCount)
            .sort((a, b) => b[1] - a[1])[0];

        if (topDriverId) {
            const driver = this.maps.drivers.get(+topDriverId[0]);
            return { name: driver?.fullName, wins: topDriverId[1] };
        }
        return null;
    },

    /**
     * Get driver career stats
     */
    getDriverCareerStats(driverId) {
        const driver = this.maps.drivers.get(driverId);
        const results = this.data.results.filter(r => r.driverId === driverId);
        
        const wins = results.filter(r => r.position === 1).length;
        const podiums = results.filter(r => r.position && r.position <= 3).length;
        const poles = results.filter(r => r.grid === 1).length;
        const points = results.reduce((sum, r) => sum + r.points, 0);
        
        const positions = results.filter(r => r.position).map(r => r.position);
        const avgFinish = positions.length ? (positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1) : 'N/A';

        // Get championship wins
        const championships = this.getDriverChampionships(driverId);

        return {
            driverId,
            name: driver?.fullName,
            nationality: driver?.nationality,
            races: results.length,
            wins,
            podiums,
            poles,
            points: Math.round(points),
            avgFinish,
            championships
        };
    },

    /**
     * Get driver championships
     */
    getDriverChampionships(driverId) {
        const championships = [];
        const seasons = this.getSeasons();

        seasons.forEach(year => {
            const standings = this.getDriverStandings(year);
            if (standings.length > 0 && standings[0].driverId === driverId) {
                championships.push(year);
            }
        });

        return championships;
    },

    /**
     * Get entity color
     */
    getEntityColor(entityId, type) {
        const colors = [
            '#E10600', '#00D2BE', '#0600EF', '#FF8700', '#006F62',
            '#005AFF', '#900000', '#2B4562', '#B6BABD', '#F596C8',
            '#9B0000', '#0072C6', '#F58020', '#52E252', '#FFF500'
        ];
        
        // Use consistent color based on entity ID
        return colors[entityId % colors.length];
    },

    /**
     * Global stats
     */
    getGlobalStats() {
        const uniqueDrivers = new Set(this.data.results.map(r => r.driverId)).size;
        const uniqueConstructors = new Set(this.data.results.map(r => r.constructorId)).size;
        const uniqueCircuits = new Set(this.data.races.map(r => r.circuitId)).size;
        
        return {
            totalRaces: this.data.races.length,
            totalDrivers: uniqueDrivers,
            totalConstructors: uniqueConstructors,
            totalCircuits: uniqueCircuits
        };
    }
};

// Export
window.DataLoader = DataLoader;
