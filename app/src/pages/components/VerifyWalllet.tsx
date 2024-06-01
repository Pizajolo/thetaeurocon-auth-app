"use client";
import React, {useEffect, useState} from 'react';
import {useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider} from '@web3modal/ethers/react';
import styles from './Verify.module.css';
import LoadingIndicator from "@/pages/components/loadingIndicator";
import api from "@/pages/utils/api";
import TicketNFT from "@/pages/components/TicketNFT";
import RedeemableNFT from "@/pages/components/RedeemableNFT";
const ThetaPass = require("@thetalabs/theta-pass");

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    idNumber: string;
    address: string;
    email: string;
    wallet: string;
}
interface TicketNFTProps {
    tokenId: number;
    name: string;
    imageUrl: string;
    userInfo: User;
    setTicketId: number;
    wallet: string;
}

export interface Ticket {
    id: number;
    tokenId: number;
    userName: string;
}

const redirectUrl = "https://register.theta-euro.com";
const VerifyWallet: React.FC = () => {

    const [isConnectHighlighted, setIsConnectHighlighted] = useState(false);
    const { walletProvider } = useWeb3ModalProvider();
    const { open, close } = useWeb3Modal();
    const { address, chainId, isConnected } = useWeb3ModalAccount()
    const [nfts, setNFTs] = useState<{ tickets: TicketNFTProps[], bottles: TicketNFTProps[], userTickets: Ticket[] } | null>(null);
    const [isLoading, setLoading] = useState(false);
    const [activeWallets, setActiveWallets] = useState<{wallet: string | null, thetaDrop: string | null}>({wallet: null, thetaDrop: null});
    const [signature, setSignature] = useState('');
    useEffect(() => {
        const waitOnThetaDrop = async () => {
            try {
                if (typeof window !== "undefined") {
                    const response = await ThetaPass.getResponse();
                    const {request, result} = response;
                    const{address, signature} = result;
                    console.log(signature)
                    if(activeWallets.thetaDrop == null) {
                    //     console.log('Signature:', signature)
                        setSignature(signature);
                    //     // setThetaDropAddress(result[0]);
                        setActiveWallets(prevState => ({ ...prevState, thetaDrop: address }));
                    }
                }
            } catch {
                console.log("No ThetaDrop wallet")
            }
        }
        waitOnThetaDrop()
    }, [])

    useEffect(() => {
        console.log('setAddress', address ? address : null)
        setActiveWallets(prevState => ({ ...prevState, wallet: address ? address : null }));
    }, [address]);

    useEffect(() => {
        console.log("UseEffect:",activeWallets)
        const getUserNFTs = async () => {
            const res = await api.get('userInfo?' + (activeWallets.wallet ? 'walletAddress[]='+ activeWallets.wallet : '') + (activeWallets.thetaDrop? '&walletAddress[]='+activeWallets.thetaDrop : ''));
            console.log(res.data, res.data.wallets.length)
            if(res.data.nfts && res.data.wallets.length == (activeWallets.wallet ? 1 : 0) + (activeWallets.thetaDrop ? 1 : 0)) {
                setNFTs(res.data.nfts)
            }
        }
        if(activeWallets.wallet || activeWallets.thetaDrop) getUserNFTs()
    }, [activeWallets]);

    const handleThetaDropClick = async () => {
        // Add functionality for ThetaDrop Wallet verification here
        console.log('ThetaDrop Wallet Verification');
        ThetaPass.signMessage('bfc3f0a9405bad43d354bbe576546a321096853b6a631ddc0c9841ef04e7c1fb', redirectUrl, null, false);
    };


    const handleWalletConnectClick = () => {
        // Add functionality for WalletConnect verification here
        setLoading(true);
        open()
    };

    const handleThetaDropDisconnect = () => {
        // setThetaDropAddress(null);
        setSignature('')
        setActiveWallets({...activeWallets, thetaDrop:null})
        const url = window.location.protocol + '//' + window.location.host + window.location.pathname;
        window.history.replaceState({ path: url }, '', url);
    };

    const closeAll = () => {
        setLoading(false);
        setIsConnectHighlighted(false);
    };
    if(isLoading) {
        return (
            <div className={styles.container}>
                <LoadingIndicator/>
            </div>
                )
    }
    if(!activeWallets.wallet && !activeWallets.thetaDrop) {
        return (
            <div className={styles.container}>
                <h1 className={styles.heading}>Connect Your Wallets to signup for ThetaEuroCon</h1>
                <div className={styles.buttonContainer}>
                    <button onClick={handleThetaDropClick} className={styles.button}>
                        Connect ThetaDrop
                    </button>
                    <div
                        onClick={closeAll}
                    >
                        <button onClick={handleWalletConnectClick} className={styles.button}>
                            Connect Wallet
                        </button>
                        {/*<w3m-button balance={'hide'} size={'md'}/>*/}
                    </div>
                </div>
                <span className={styles.infoTxt}>Use the &quot;Connect ThetaDrop&quot; Wallet Button if you hold your Ticket NFT on ThetaDrop. Otherwise use &quot;Connect Wallet&quot;. You can connect your ThetaDrop account and MetaMask wallet at the same time to claim your Redeemables</span>
                <div style={{width: '400px', textAlign: 'center'}}>
                    <h5 className={styles.heading}>1. Buy an ThetaEuroCon Ticket on OpenTheta or ThetaDrop</h5>
                    <h5 className={styles.heading}>2. Sign in with the wallet you hold the Ticket with</h5>
                    <h5 className={styles.heading}>3. Set the personal information for each ticket you own</h5>
                    <h5 className={styles.heading}>Optional (If you own Redeemable NFTs):</h5>
                    <h5 className={styles.heading}>4. Select the Person (Ticket) that should get the Bottles when checking in at ThetaEuroCon</h5>
                </div>
            </div>
        );
    } else if (nfts) {
        return (
            <div className={styles.container}>
                <h1 className={styles.heading}>Verify Your Tickets and Redeemables</h1>
                <div className={styles.buttonContainer}>
                    {activeWallets.thetaDrop ?
                        <button onClick={handleThetaDropDisconnect} className={styles.buttonDisconnect}>
                            Disconnect ThetaDrop
                        </button>
                        :
                        <button onClick={handleThetaDropClick} className={styles.buttonDisconnect}>
                            Connect ThetaDrop
                        </button>
                    }
                    <div onClick={closeAll}>
                        <w3m-button balance={'hide'} size={'md'}/>
                    </div>
                </div>
                <h1 className={styles.subtitle}>Tickets</h1>
                {nfts.tickets.map(nft => (
                    <div key={nft.tokenId + "tickets"}>
                        <TicketNFT ticketInfo={nft} wallet={nft.wallet} walletType={nft.wallet == activeWallets.thetaDrop ? "ThetaDrop" : 'wallet' } signature={signature}/>
                        {/*<TicketNFT tokenId={nft.tokenId} name={nft.name} image={nft.imageUrl} wallet={address} walletType={'wallet'}/>*/}
                    </div>
                ))}
                <h1 className={styles.subtitle}>Redeemables</h1>
                {nfts.bottles.map(nft => (
                    <div key={nft.tokenId + "redeemable"}>
                        <RedeemableNFT ticketsInfo={nfts.userTickets} redeemableNFT={nft} wallet={nft.wallet} walletType={nft.wallet == activeWallets.wallet ? "wallet" : 'ThetaDrop'} signature={signature}/>
                        {/*<TicketNFT tokenId={nft.tokenId} name={nft.name} image={nft.imageUrl} wallet={address} walletType={'wallet'}/>*/}
                    </div>
                ))}
            </div>
        );
    } else {
        return <div className={styles.loadingContainer}>
            <LoadingIndicator />
        </div>
    }
};

export default VerifyWallet;