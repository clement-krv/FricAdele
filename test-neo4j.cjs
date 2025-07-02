const Neo4jService = require('./backend/services/neo4jService');

async function testNeo4jConnection() {
    console.log('🔍 Test de connexion Neo4j...\n');
    
    const neo4jService = new Neo4jService();
    
    try {
        // Test de connexion
        const connected = await neo4jService.connect();
        console.log(`✅ Connexion Neo4j : ${connected ? 'SUCCÈS' : 'ÉCHEC'}`);
        
        if (connected) {
            // Test d'une requête simple
            const session = neo4jService.getSession();
            const result = await session.run('RETURN 1 as test');
            session.close();
            
            console.log('✅ Requête de test : SUCCÈS');
            console.log(`📊 Résultat : ${result.records[0].get('test')}`);
            
            // Test de comptage des données existantes
            const countSession = neo4jService.getSession();
            const countResult = await countSession.run('MATCH (e:Expense) RETURN COUNT(e) as count');
            const expenseCount = countResult.records[0]?.get('count')?.toNumber() || 0;
            countSession.close();
            
            console.log(`📈 Dépenses dans Neo4j : ${expenseCount}`);
            
            if (expenseCount === 0) {
                console.log('⚠️  Aucune donnée trouvée. Importez le CSV via Neo4j Browser :');
                console.log('   http://localhost:7474');
                console.log('   Utilisez la requête dans neo4j-queries.cypher');
            }
        }
        
        await neo4jService.close();
        console.log('\n🎉 Test terminé avec succès !');
        
    } catch (error) {
        console.error('❌ Erreur lors du test :', error.message);
        process.exit(1);
    }
}

// Exécuter le test
testNeo4jConnection();
