import { useAuth } from "../utils/useAuth";
import "../styles/Account.css";
import { LogoutIcon } from "../assets/Icons";
import CopyButton from "../components/CopyButton";

export default function Account() {
  const { user, logout } = useAuth();
  const email = () => user()?.email;
  const uid = () => user()?.uid;

  return (
    <section className="account full-height">
      <h1>Compte</h1>

      <dl className="account-info ">
        <div className="info-row">
          <dt>Courriel</dt>
          <dd className="data card">
            {email()} <CopyButton content={email()} />
          </dd>
        </div>

        <div className="info-row">
          <dt>Identifiant</dt>
          <dd className="data card">
            {uid()} <CopyButton content={uid()} />
          </dd>
        </div>
        <button className="btn subtle" onClick={() => logout()}>
          <LogoutIcon />
          <h5>Déconnexion</h5>
        </button>
      </dl>
    </section>
  );
}
