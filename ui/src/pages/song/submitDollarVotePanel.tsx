import styled from "styled-components";
import React, { useState } from "react";

export const SubmitDollarVotePanelContents = styled.div`
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
  column-gap: 1vh;
  font-size: 4vh;
`;

const RequestValueInput = styled.input`
  max-width: 7vh;
  font-size: 4vh;
  padding-left: 4vh;
`;

const RequestLabel = styled.label`
  display: flex;
  align-items: center;
`;

const CurrencyLabel = styled.div`
  position: relative;
  right: -2vh;
  width: 0;
  font-size: 4vh;
  color: lightgrey;
  top: -0.5vh;
`;

const Instructions = styled.div`
  margin-top: 0.5vh;
  font-size: 3vh;
  color: slategray;
  text-align: center;
  font-style: italic;
`;

interface DollarVote {
  value: number;
}

export const SubmitDollarVotePanel = ({
  onSubmit,
}: {
  onSubmit: (vote: DollarVote) => void;
}) => {
  const [requestValue, setRequestValue] = useState("5");

  const isReady = () => {
    return Number.isSafeInteger(Number.parseFloat(requestValue));
  };
  return (
    <>
      <SubmitDollarVotePanelContents>
        <RequestLabel htmlFor={"requestValue"}>Request</RequestLabel>
        <CurrencyLabel>$</CurrencyLabel>
        <RequestValueInput
          name={"requestValue"}
          defaultValue={requestValue}
          required={true}
          inputMode={"numeric"}
          step={1}
          minLength={1}
          type={"number"}
          maxLength={3}
          pattern="[0-9]*"
          onInput={(e) => {
            setRequestValue(e.currentTarget.value);
          }}
        />
        <button
          disabled={!isReady()}
          onClick={() =>
            onSubmit({
              value: Number.parseInt(requestValue),
            })
          }
        >
          Venmo
        </button>
      </SubmitDollarVotePanelContents>
      <Instructions>Please enter a whole dollar value.</Instructions>
    </>
  );
};
