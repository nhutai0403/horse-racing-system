import './Button.css';

export default function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`btn-custom-auth ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
