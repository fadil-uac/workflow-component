import { Slider } from 'antd';

type GraphControlProps = {
  value: number;
  onChange(value: number): void;
};

export const GraphControl: React.FC<GraphControlProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="graph-control">
      <h4>Distance</h4>
      <Slider
        value={value}
        onChange={onChange}
        max={1000}
        min={0}
        step={10}
        style={{ width: '100%', margin: 0 }}
      />
    </div>
  );
};
