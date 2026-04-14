const sseClients = new Set();

const addClient = (res) => {
    sseClients.add(res);
};

const removeClient = (res) => {
    sseClients.delete(res);
};

const broadcast = (event, data) => {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of sseClients) {
        try {
            res.write(payload);
        } catch (err) {
            sseClients.delete(res);
        }
    }
};

module.exports = { addClient, removeClient, broadcast };
