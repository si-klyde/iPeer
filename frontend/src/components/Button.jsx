const Button = ({ className, href, onClick, children, px, white }) => {
  // Set the base class names for the button, including padding, colors, and border
  const classes = `button relative inline-flex items-center justify-center h-11 transition-colors ${
    px || "px-7"
  } ${
    white
      ? "bg-white text-green-700 border border-green-700 hover:bg-green-100"
      : "bg-green-500 text-white border border-green-500 hover:bg-green-600"
  } ${className || ""} rounded-full`;

  const spanClasses = "relative z-10";

  // Function to render a button element
  const renderButton = () => (
    <button className={classes} onClick={onClick}>
      <span className={spanClasses}>{children}</span>
    </button>
  );

  // Function to render an anchor (link) element
  const renderLink = () => (
    <a href={href} className={classes}>
      <span className={spanClasses}>{children}</span>
    </a>
  );

  // Conditionally render either a button or a link, based on the presence of href
  return href ? renderLink() : renderButton();
};

export default Button;
