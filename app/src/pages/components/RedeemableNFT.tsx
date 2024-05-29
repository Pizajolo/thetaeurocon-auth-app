"use client";
import React, {useEffect, useState} from 'react';
import styles from './RedeemableNFT.module.css';
import LoadingIndicator from "@/pages/components/loadingIndicator";
import Image from "next/image";
import { BrowserProvider } from 'ethers'
import {useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider} from '@web3modal/ethers/react';
import axios from "axios";
import api from "@/pages/utils/api";

const customLoader = ({ src }: { src: string }) => {
    return src;
};

const RedeemableAddress = process.env.BOTTLE_ADDRESS;
export interface Ticket {
    id: number;
    tokenId: number;
    userName: string;
}

export interface NFT {
    tokenId: number;
    name: string;
    imageUrl: string;
    setTicketId: number | null;
}

export interface RedeemableNFTProps {
    ticketsInfo: Ticket[];
    redeemableNFT: NFT;
    wallet: string;
    walletType: 'wallet' | 'ThetaDrop';
    signature: string;
}
const RedeemableNFT: React.FC<RedeemableNFTProps> = ({ ticketsInfo, redeemableNFT, wallet, walletType , signature}) => {
    const { walletProvider } = useWeb3ModalProvider();
    const [tickets, setTickets] = useState(ticketsInfo ? ticketsInfo : null);
    const [isLoading, setLoading] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(redeemableNFT.setTicketId);
    const [NFT, setNFT] = useState(redeemableNFT)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const formData = {
            ticketId: selectedTicketId,
            walletAddress: wallet,
            tokenId: redeemableNFT.tokenId,
            contractAddress: RedeemableAddress
        };
        if(walletType == 'wallet' && walletProvider) {
            try {
                const provider = new BrowserProvider(walletProvider)
                const signer = await provider.getSigner()
                const signature = await signer?.signMessage(JSON.stringify(formData))
                const res = await api.post('/signRedeemable', {message: JSON.stringify(formData), signature: signature, walletAddress: wallet})
                console.log(res.data)
                if(res.data.success) setNFT({...NFT, setTicketId: res.data.id})
                setLoading(false);
            } catch {
                setLoading(false);
            }
        }
    };

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const ticketId = parseInt(event.target.value);
        setSelectedTicketId(ticketId);
    };

    return (
        <div className={styles.nftContainer}>
            <div className={styles.row}>
                {/* Left Side: Title and Image */}
                <div
                    className={styles.column}>
                    <h3 className={styles.nftTitle}>{redeemableNFT.name} (Edition: {redeemableNFT.tokenId})</h3>
                    <div className={styles.image}>
                        <Image
                            loader={customLoader}
                            src={redeemableNFT.imageUrl}
                            className={styles['card-img-top']}
                            alt={redeemableNFT.name}
                            width={300}
                            height={300}
                            fetchPriority="high"
                        />
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className={styles.column}>
                    {isLoading ?
                        <div className={styles.loadingContainer}>
                            <LoadingIndicator />
                        </div>
                        : ''}
                    <form onSubmit={handleSubmit}>
                        <div>
                            {tickets ?
                                <><label className={styles.label}>Select ticket to get the redeemable bottles at arrival:</label>
                                    <select id="ticketDropdown" className={styles.formControl} value={selectedTicketId ? selectedTicketId : undefined}
                                            onChange={handleSelectChange}>
                                        <option value="">Select a ticket</option>
                                        {tickets.map((ticket) => (
                                            <option key={ticket.id} value={ticket.id}>
                                                {ticket.userName} (TokenID: {ticket.tokenId})
                                            </option>
                                        ))}z
                                    </select>
                                    <button type="submit" className={styles.btn}>{NFT.setTicketId ? "Update" : "Submit"}</button>
                                </>
                                : <span>You have to own at least one ticket! And set this ticket!</span>}
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default RedeemableNFT;