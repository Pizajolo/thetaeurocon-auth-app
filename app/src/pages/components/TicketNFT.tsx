"use client";
import React, {useEffect, useState} from 'react';
import styles from './TicketNFT.module.css';
import LoadingIndicator from "@/pages/components/loadingIndicator";
import Image from "next/image";
import { BrowserProvider } from 'ethers'
import {useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider} from '@web3modal/ethers/react';
import axios from "axios";
import api from "@/pages/utils/api";
const ThetaPass = require("@thetalabs/theta-pass");


const customLoader = ({ src }: { src: string }) => {
    return src;
};

const ticketAddress = process.env.TICKET_ADDRESS;
export interface Ticket {
    tokenId: number;
    name: string;
    imageUrl: string;
    userInfo: User | null;
}

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    idNumber: string;
    address: string;
    email: string;
    wallet: string;
}

export interface TicketNFTProps {
    ticketInfo: Ticket;
    wallet: string;
    walletType: 'wallet' | 'ThetaDrop';
    signature: string ;
}

const TicketNFT: React.FC<TicketNFTProps> = ({ ticketInfo, wallet, walletType, signature }) => {
    const { walletProvider } = useWeb3ModalProvider();
    const [firstName, setFirstName] = useState(ticketInfo.userInfo ? ticketInfo.userInfo.firstName : '');
    const [lastName, setLastName] = useState(ticketInfo.userInfo ? ticketInfo.userInfo.lastName : '');
    const [idNumber, setIdNumber] = useState( 'xx');
    const [address, setAddress] = useState('xx');
    const [email, setEmail] = useState(ticketInfo.userInfo ? ticketInfo.userInfo.email : '');
    const [isLoading, setLoading] = useState(false);
    const [userData, setUserData] = useState<User | null>(ticketInfo.userInfo ? ticketInfo.userInfo : null);
    const [updating, setIsUpdating] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const formData = {
            firstName,
            lastName,
            idNumber,
            address,
            email,
            tokenId: ticketInfo.tokenId,
            contractAddress: ticketAddress,
        };
        if(walletType == 'wallet' && walletProvider) {
            try {
                const provider = new BrowserProvider(walletProvider)
                const signer = await provider.getSigner()
                const signature = await signer?.signMessage(JSON.stringify(formData))
                const res = await api.post('/signin', {message: JSON.stringify(formData), signature: signature, walletAddress: wallet})
                console.log(res.data)
                if(res.data.success) {
                    setUserData( {
                        id: res.data.id,
                        firstName: firstName,
                        lastName: lastName,
                        idNumber: idNumber,
                        address: address,
                        email: email,
                        wallet: userData ? userData.wallet : ''
                    })
                    setIsUpdating(false)
                }
                setLoading(false);
            } catch {
                setLoading(false);
            }
        } else {
            console.log(signature)
            const res = await api.post('/signinTD', {message: 'bfc3f0a9405bad43d354bbe576546a321096853b6a631ddc0c9841ef04e7c1fb', signature: signature, info:formData,  walletAddress: wallet})
            console.log(res.data)
            if(res.data.success) {
                setUserData( {
                    id: res.data.id,
                    firstName: firstName,
                    lastName: lastName,
                    idNumber: idNumber,
                    address: address,
                    email: email,
                    wallet: userData ? userData.wallet : ''
                })
                setIsUpdating(false)
            }
            setLoading(false);
        }
        window.location.reload();
    };

    return (
        <div className={styles.nftContainer}>
            <div className={styles.row}>
                {/* Left Side: Title and Image */}
                <div
                    className={styles.column}>
                    <h3 className={styles.nftTitle}>{ticketInfo.name}</h3>
                    <div className={styles.image}>
                        <Image
                            loader={customLoader}
                            src={ticketInfo.imageUrl}
                            className={styles['card-img-top']}
                            alt={ticketInfo.name}
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
                    {userData && !updating ?
                        <>
                            <div>
                                <label htmlFor="firstName">First Name</label>
                                <div id="firstName" className={styles.formControl}>
                                    {firstName}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="lastName">Last Name</label>
                                <div id="lastName" className={styles.formControl}>
                                    {lastName}
                                </div>
                            </div>
                            {/*<div>*/}
                            {/*    <label htmlFor="idNumber">ID Number</label>*/}
                            {/*    <div id="idNumber" className={styles.formControl}>*/}
                            {/*        {idNumber}*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                            {/*<div>*/}
                            {/*    <label htmlFor="address">Address</label>*/}
                            {/*    <div id="address" className={styles.formControl}>*/}
                            {/*        {address}*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                            <div>
                                <label htmlFor="email">Email</label>
                                <div id="email" className={styles.formControl}>
                                    {email}
                                </div>
                            </div>
                            <button className={styles.btn} onClick={() => setIsUpdating(true)}>Update</button>
                        </>
                        :
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="firstName">First Name</label>
                                <input type="text" className={styles.formControl} id="firstName" value={firstName}
                                       onChange={(e) => setFirstName(e.target.value)}
                                       required/>
                            </div>
                            <div>
                                <label htmlFor="lastName">Last Name</label>
                                <input type="text" className={styles.formControl} id="lastName" value={lastName}
                                       onChange={(e) => setLastName(e.target.value)}
                                       required/>
                            </div>
                            {/*<div>*/}
                            {/*    <label htmlFor="idNumber">ID Number</label>*/}
                            {/*    <input type="text" className={styles.formControl} id="idNumber" value={idNumber}*/}
                            {/*           onChange={(e) => setIdNumber(e.target.value)}*/}
                            {/*           required/>*/}
                            {/*</div>*/}
                            {/*<div>*/}
                            {/*    <label htmlFor="address">Address</label>*/}
                            {/*    <input type="text" className={styles.formControl} id="address" value={address}*/}
                            {/*           onChange={(e) => setAddress(e.target.value)}*/}
                            {/*           required/>*/}
                            {/*</div>*/}
                            <div>
                                <label htmlFor="email">Email</label>
                                <input type="email" className={styles.formControl} id="email" value={email}
                                       onChange={(e) => setEmail(e.target.value)}
                                       required/>
                            </div>
                            <button type="submit" className={styles.btn}>Submit</button>
                        </form>
                    }
                </div>
            </div>
        </div>
    );
};

export default TicketNFT;