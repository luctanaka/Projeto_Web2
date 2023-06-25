const express = require('express');
const router = express.Router();

const { ObjectId } = require('mongodb');
const PastelController = require('../controller/pastelController');
const pastelController = new PastelController();
const PedidoController = require('../controller/pedidos_pastelController');
const pedidoController = new PedidoController();
const auth = require('../middleware/autenticacao')
router.use(auth);
router.get('/pastel',  async(req, res) => {
    pastelController.readPasteis()
      .then((pasteis) => {
        res.render('pastel', {pasteis: pasteis });
      })
      .catch((error) => {
        res.status(500).json({ error: 'Ocorreu um erro ao obter a lista de produtos.' });
      });
  });


router.get('/novoPastel', (req, res) => {
    res.render('criar_pastel');
});

router.get('/editarPastel/:id', (req, res) => {
    const PastelId = req.params.id;

    const teste = new ObjectId(PastelId);
    pastelController.findOne(teste)
        .then((Pastels) => {
            res.render('editarPastel', { Pastels });
        })
        .catch((error) => {
            res.status(500).json({ error: 'Ocorreu um erro ao buscar o Pastel.' });
        });
});

router.post('/editarPastel', (req, res) => {
    const { id, nome, medida, PastelAntigo } = req.body;
    const novoPastel = {
        nome,
        medida,
        timestamp: new Date().getTime(), // Adicionar o timestamp
    };
    const Pastel = req.params.Pastel;

    pastelController.updatePastel(id, novoPastel)
        .then(() => {
            pedidoController.updatePedidoPastel(PastelAntigo, nome)
                .then(() => {
                    res.redirect('/Pastels');
                }).catch((error) => {
                    res.status(500).json({ error: 'Ocorreu um erro ao atualizar o Pastel123.' });
                });
        })
        .catch((error) => {
            res.status(500).json({ error: 'Ocorreu um erro ao atualizar o Pastel.' });
        });
});

router.delete('/:id/:nome', (req, res) => {
    const PastelId = req.params.id;
    const Pastel = req.params.nome;
    const teste = new ObjectId(PastelId);
    console.log(Pastel)
    pastelController.deletePastel(teste)
        .then((result) => {
            pedidoController.deletePedidoPastel(Pastel)
                .then(() => {
                    res.status(200).json({ result: result + "Pastel deletado." });
                }).catch((error) => {
                    res.status(500).json({ error: error + 'Ocorreu um erro ao excluir o Pastel.' });
                });
        })
        .catch((error) => {
            res.status(500).json({ error: error + 'Ocorreu um erro ao excluir o Pastel.' });
        });
});

router.post('/', (req, res) => {
    const { nome, preco, descricao } = req.body;

    const novoPastel = {
        nome,
        preco,
        descricao,
    };

    pastelController.createPastel(novoPastel)
        .then(() => {
            res.redirect('/pastel/pastel');
        })
        .catch((error) => {
            res.status(500).json({ error: 'Ocorreu um erro ao cadastrar o Pastel.' });
        });
});
module.exports = router;