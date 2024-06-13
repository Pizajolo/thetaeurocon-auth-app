import connection from "../db.js";

export const setTicket = async (firstName, lastName, address, idNumber, walletAddress, email, tokenId) => {
    console.log(firstName, lastName, address, idNumber, walletAddress, email, tokenId)
    const now = Math.floor(Date.now() / 1000)
    try {
        await connection.execute(
            `INSERT INTO tickets (first_name, last_name, address, id_number, wallet_address, email, token_id, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, FROM_UNIXTIME(?))
               ON DUPLICATE KEY UPDATE
               first_name = VALUES(first_name),
               last_name = VALUES(last_name),
                 address = VALUES(address),
                 id_number = VALUES(id_number),
                 wallet_address = VALUES(wallet_address),
                 email = VALUES(email),
                 created_at = VALUES(created_at)`,
            [firstName, lastName, address, idNumber, walletAddress, email, tokenId, now]
        );
        const ticketId = await getTicketIdByTokenId(tokenId);

        return {success: true, id: ticketId};
    } catch (error) {
        console.error('Error inserting ticket info:', error);
        return false
    }
}

const getTicketIdByTokenId = async (tokenId) => {
    try {
        let [row] = await connection.execute(
            'SELECT id FROM tickets WHERE token_id = ?',
            [tokenId]
        );
        if (row.length > 0) {
            return row[0].id;
        } else {
            return null; // No ticket found with the given token_id
        }
    } catch (error) {
        console.error('Error fetching ticket ID:', error);
        throw error;
    }
};

export const getTicket = async (tokenId) => {
    try {
        let [row] = await connection.execute(
            'SELECT * FROM tickets WHERE token_id = ?',
            [tokenId]
        );
        if (row.length > 0) {
            return {
                id: row[0].id,
                firstName: row[0].first_name.slice(0,1) + '...',
                lastName: row[0].last_name.slice(0,1) + '...',
                idNumber: 'xx',
                address: 'xx',
                email: row[0].email.slice(0,1) + '...',
                wallet: row[0].wallet_address,
            };
        } else {
            return null; // No ticket found with the given token_id
        }
    } catch (error) {
        console.error('Error fetching ticket ID:', error);
        throw error;
    }
}

export const getRedeemableTicketId = async (tokenId) => {
    try {
        let [row] = await connection.execute(
            'SELECT tickets.id FROM redeemables JOIN tickets ON redeemables.ticket_id = tickets.id WHERE redeemables.token_id = ?',
            [tokenId]
        );
        if (row.length > 0) {
            return row[0].id;
        } else {
            return null; // No ticket found with the given token_id
        }
    } catch (error) {
        console.error('Error fetching ticket ID:', error);
        throw error;
    }
}

export const getAllTicketsOfWallet = async (walletAddress) => {
    try {
        // let [row] = await connection.execute(
        //     'SELECT id, token_id AS tokenId, CONCAT(first_name, \' \', last_name) AS userName  FROM tickets WHERE wallet_address = ?',
        //     [walletAddress]
        // );
        const placeholders = walletAddress.map(() => '?').join(',');

        // Prepare the SQL query
        const query = `SELECT id, token_id AS tokenId, CONCAT(SUBSTRING(first_name, 1, 1), '. ', SUBSTRING(last_name, 1, 1), '.') AS userName 
                   FROM tickets 
                   WHERE wallet_address IN (${placeholders})`;

        // Execute the query
        const [rows] = await connection.execute(query, walletAddress);

        if (rows.length > 0) {
            return rows;
        } else {
            return null; // No ticket found with the given token_id
        }
    } catch (error) {
        console.error('Error fetching ticket ID:', error);
        throw error;
    }
}

export const setRedeemable = async (ticketId, tokenId) => {
    console.log(ticketId, tokenId)
    const now = Math.floor(Date.now() / 1000)
    if(ticketId == null) {
        try {
            const [result] = await connection.execute(
                'DELETE FROM redeemables WHERE token_id = ?',
                [tokenId]
            );

            if (result.affectedRows > 0) {
                return {success: true, id: null};
            } else {
                console.log(`No row found with token_id ${tokenId}.`);
                return {success: false, id: null};
            }
        } catch (error) {
            console.error('Error deleting redeemable:', error);
            throw error;
        }
    } else {
        try {
            await connection.execute(
                `INSERT INTO redeemables (ticket_id, token_id, created_at)
               VALUES (?, ?, FROM_UNIXTIME(?))
               ON DUPLICATE KEY UPDATE
                 ticket_id = VALUES(ticket_id),
                 created_at = VALUES(created_at)`,
                [ticketId, tokenId, now]
            );
            const redeemableId = await getRedeemableIdByTokenId(tokenId);

            return {success: true, id: redeemableId};
        } catch (error) {
            console.error('Error inserting redeemable info:', error);
            return false
        }
    }
}

const getRedeemableIdByTokenId = async (tokenId) => {
    try {
        let [row] = await connection.execute(
            'SELECT id FROM redeemables WHERE token_id = ?',
            [tokenId]
        );
        if (row.length > 0) {
            return row[0].id;
        } else {
            return null; // No ticket found with the given token_id
        }
    } catch (error) {
        console.error('Error fetching ticket ID:', error);
        throw error;
    }
};