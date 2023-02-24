import { Button } from 'antd';

import { IWorkflowNode } from '../interface';

type StateViewProps = {
  node: IWorkflowNode;
  onFilterConnectedNodes(node: IWorkflowNode): void;
};

export const StateView: React.FC<StateViewProps> = ({
  node,
  onFilterConnectedNodes,
}) => {
  return (
    <div
      className="state-view"
      style={{
        position: 'absolute',
        left: node.x,
        top: node.y,
      }}
    >
      <div className="state-header">
        <div className="state-title">{node.label}</div>
        <div className="state-status">
          {node.state && node.state.finalState && 'Final'}
        </div>
      </div>

      {node.state && (
        <div className="state-content">
          {node.state.tasks && (
            <div className="tasks">
              <div className="content-title">Task:</div>
              <div className="content-list">
                {Object.entries(node.state.tasks).map(([key, value]) => (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'start',
                    }}
                  >
                    <div>
                      {key}({value['type']})
                    </div>
                    <div>{value['label']}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {node.state.data && (
            <div className="datas">
              <div className="content-title">Data:</div>
              <div className="content-list">
                {Object.entries(node.state.data).map(([key, value]) => (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'start',
                    }}
                  >
                    <div>
                      {key}({value['component']})
                    </div>
                    <div>{value['usage']}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Button
        type="primary"
        style={{ marginTop: '1rem' }}
        onClick={() => {
          onFilterConnectedNodes(node);
        }}
      >
        Show connected only
      </Button>
    </div>
  );
};
