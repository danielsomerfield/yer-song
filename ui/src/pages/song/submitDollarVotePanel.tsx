import styled from "styled-components";
import React, { useState } from "react";
import { Label } from "@radix-ui/react-label";

export const PanelContainer = styled.div``;

export const SubmitDollarVotePanelContents = styled.div`
  display: flex;
  flex-flow: row;
  align-items: center;
  column-gap: 1vh;
  font-size: 4vh;
`;

const CreditCodePanelContents = styled.div`
  display: flex;
  flex-flow: row;
  align-items: stretch;
  column-gap: 1vh;
  font-size: 4vh;
  margin-top: 3vh;
`;

const TotalValuePanelContents = styled.div`
  display: flex;
  flex-flow: row;
  align-items: center;
  column-gap: 1vh;
  font-size: 4vh;
  margin-top: 3vh;
`;

const RequestValueInput = styled.input`
  max-width: 7vh;
  font-size: 4vh;
  padding-left: 4vh;
`;

const CreditCodeInput = styled.input`
  font-size: 3vh;
  text-align: center;
  text-transform: uppercase;
`;

const RequestLabel = styled.label`
  display: flex;
  align-items: center;
`;

const CurrencyLabel = styled.div`
  position: relative;
  right: -2vh;
  width: 0;
  font-size: 3.5vh;
  color: darkslategrey;
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

const CreditCodePanel = () => {
  return (
    <>
      <CreditCodePanelContents>
        <RequestLabel htmlFor={"creditCode"}>Credit</RequestLabel>
        <CreditCodeInput
          name={"creditCode"}
          defaultValue={""}
          required={false}
          inputMode={"text"}
          step={1}
          type={"text"}
          onInput={(e) => {
            console.log(e);
          }}
          placeholder={"e.g. XNTDLC"}
        />
      </CreditCodePanelContents>
    </>
  );
};

const TotalValuePanel = () => {
  return (
    <>
      <TotalValuePanelContents>
        <RequestLabel>Total Contribution</RequestLabel>
        <Label>$123</Label>
      </TotalValuePanelContents>
    </>
  );
};

export const SubmitDollarVotePanel = ({
  onSubmit,
}: {
  onSubmit: (vote: DollarVote) => void;
}) => {
  const [requestValue, setRequestValue] = useState("5");

  const isReady = () => {
    const asFloat = Number.parseFloat(requestValue);
    return Number.isSafeInteger(asFloat) && asFloat > 0;
  };
  return (
    <>
      <PanelContainer>
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
        <CreditCodePanel />
        <Instructions>Got a voucher? Enter it above.</Instructions>
        <TotalValuePanel />
      </PanelContainer>
    </>
  );
};
