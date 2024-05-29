import Image from "next/image";
import styles from "./index.module.css";
import VerifyWallet from "@/pages/components/VerifyWalllet";
import Link from "next/link";

export default function Home() {
    return (
        <main className={styles.main}>
            <nav className={styles.navbar}>
                <div className={styles.navRight}>
                    <img src="/eurocon.png" alt="Logo" className={styles.logo}/>
                </div>
                <div className={styles.navLeft}>
                    <Link href="https://theta-euro.com">
                        <span className={styles.navLink}>Theta-Euro.COM</span>
                    </Link>
                </div>
            </nav>
            <VerifyWallet></VerifyWallet>
        </main>
    );
}
