import styled from "styled-components";
import React, { useState } from "react";

export const SubmitDollarVotePanelContents = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  row-gap: 1vh;
`;

const PayNowButton = styled.button`
  width: 90%;
  min-height: 10vh;
  max-height: 14vh;
  margin: 0.5vh;
  font-size: 3.5vh;
  min-width: 6vh;
`;

const EntryWrapper = styled.div`
  display: flex;
  flex-direction: row;
  column-gap: 1vh;
`;

export const DollarEntryComponent = styled.div`
  display: flex;
  flex-direction: row;
`;

const RequestValueInput = styled.input`
  max-width: 9vh;
  font-size: 5vh;
  padding-left: 3vh;
`;

const VoucherInput = styled.input`
  max-width: 28vh;
  font-size: 5vh;
  font-variant: all-small-caps;
  text-align: center;

  &::placeholder {
    font-variant: normal;
    font-size: 4vh;
  }
`;

const CurrencyLabel = styled.div`
  position: relative;
  right: -1vh;
  width: 0;
  font-size: 3.5vh;
  color: darkslategrey;
  top: 0.25vh;
`;

interface DollarVote {
  value: number;
  voucher?: string;
}

export const SubmitDollarVotePanel = ({
  onSubmit,
}: {
  onSubmit: (vote: DollarVote) => void;
}) => {
  const [requestValue, setRequestValue] = useState("5");
  const [voucher, setVoucher] = useState("");

  const isReady = () => {
    const asFloat = Number.parseFloat(requestValue);
    return Number.isSafeInteger(asFloat) && asFloat > 0 && asFloat < 1000;
  };
  return (
    <>
      <SubmitDollarVotePanelContents
        className={"SubmitDollarVotePanelContents"}
      >
        <EntryWrapper className={"EntryWrapper"}>
          <DollarEntryComponent className="DollarEntryComponent">
            <CurrencyLabel>$</CurrencyLabel>
            <RequestValueInput
              name={"requestValue"}
              defaultValue={requestValue}
              required={true}
              inputMode={"numeric"}
              minLength={1}
              max={999}
              type={"number"}
              onInput={(e) => {
                setRequestValue(e.currentTarget.value);
              }}
            />
          </DollarEntryComponent>
          <VoucherInput
            name={"voucher"}
            defaultValue={voucher}
            required={false}
            minLength={6}
            maxLength={6}
            type={"text"}
            pattern="[a-zA-Z0-9]*"
            onInput={(e) => {
              setVoucher(e.currentTarget.value);
            }}
            placeholder={"Got a voucher?"}
          />
        </EntryWrapper>

        <PayNowButton
          disabled={true}
          onClick={(evt) => {
            evt.currentTarget.disabled = true;
            try {
              onSubmit({
                value: Number.parseInt(requestValue),
                voucher: voucher,
              });
            } finally {
              // TODO: this does not work. I think because the events fired above are async
              // This needs to after an await or the like on the returned promise from the call.
              evt.currentTarget.disabled = false;
            }
          }}
        >
          Pay now!
        </PayNowButton>
      </SubmitDollarVotePanelContents>
    </>
  );
};
