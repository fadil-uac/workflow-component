import { Button } from 'antd';
import { useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import { IWorkflowNode } from '../interface';

type StateViewProps = {
  node: IWorkflowNode;
  onClickOutside(): void;
  onFilterConnectedNodes(node: IWorkflowNode): void;
};

export const StateView: React.FC<StateViewProps> = ({
  node,
  onClickOutside,
  onFilterConnectedNodes,
}) => {
  const stateViewRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(stateViewRef, () => {
    onClickOutside();
  });

  return (
    <div ref={stateViewRef} className="state-view">
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
                    key={key}
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
                    key={key}
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

      <div className="state-footer">
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
    </div>
  );
};
