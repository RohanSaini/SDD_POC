var elasticsearch = require('@elastic/elasticsearch');
var client = new elasticsearch.Client({ node: 'http://localhost:9200' });

module.exports = {

    actquery: (input) => {
        return new Promise( async (resolve, reject) =>{
            const response = await client.search({
                index: 'aa40n41',
                type:'sentences',
                body: {
                    "query": {
                      "multi_match": {
                          "query":   input,
                          "fields":   [ "doc", "questions" ]
                      }
                    }
                  }
              })
              resolve(response.body.hits.hits[0]['_source']);
        })
    },
    coiquery: (input) => {
        return new Promise(async (resolve, reject) =>{
            const response = await client.search({
                index: 'coidocindex2',
                type:'sentences',
                body: {
                    "query": {
                      "multi_match": {
                          "query":   input,
                          "fields":   [ "doc", "questions" ]
                      }
                    }
                  }
              })
              console.log(response);
              resolve(response.body.hits.hits[0]['_source']);
        })
    },
    hocquery: (input) => {
        return new Promise(async (resolve, reject) =>{
            const response = await client.search({
                index: 'hoc2',
                type:'sentences',
                body: {
                    "query": {
                      "multi_match": {
                          "query":   input,
                          "fields":   [ "doc", "questions" ]
                      }
                    }
                  }
              })
              resolve(response.body.hits.hits[0]['_source']);
        })
    },
    incident:(input) => {
        return new Promise(async (resolve, reject) => {
            const invetigationtype = await client.search({
                index: 'incidentreport',
                type:'sentences',
                body: {
                    "query": {
                      "multi_match": {
                          "query":   input,
                          "fields":   [ "tag", "context" ]
                      }
                    }
                  }
              });
              
              
              let formalscore;
              let formaltag;
              if (invetigationtype.body.hits.hits.length > 0) {
                formalscore = invetigationtype.body.hits.hits[0]['_score'];
                formaltag = invetigationtype.body.hits.hits[0]['_source']['tag'];
           } else {
                formalscore = 0;
                formaltag = 'nomatch';
           }

            resolve({
                res: [formalscore,formaltag]
            })

        })
    },
    coicheck: (input) => {
        return new Promise( async (resolve, reject) => {
            const coi = await client.search({
                index: 'coireport',
                type:'sentences',
                body: {
                    "query": {
                      "multi_match": {
                          "query":   input,
                          "fields":   [ "tag", "context" ]
                      }
                    }
                  }
              });
              let coiscore;
              let coitag;
              if(coi.body.hits.hits.length > 0) {
                coiscore = coi.body.hits.hits[0]['_score'];
                coitag = coi.body.hits.hits[0]['_source']['tag'];
           } else {
                coiscore = 0;
                coitag = 'nomatch';  
               
           }

           resolve([coiscore,coitag])
        })
    }
}