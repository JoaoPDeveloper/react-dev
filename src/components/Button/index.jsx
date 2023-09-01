import "./styles.css";

export const Button = ({ text, onclick, disabled }) => (
  <Button className="button" onclick={onclick} disabled={disabled}>
    {text}
  </Button>
);
