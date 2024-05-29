import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './LoadingIndicator.module.css'

export default function LoadingIndicator() {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
        </div>
    );
}