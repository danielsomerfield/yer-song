import styled from "styled-components";
import React, { useState } from "react";

export const SubmitDollarVotePanelContents = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  column-gap: 1vh;
  font-size: 4vh;
  row-gap: 3vh;
`;

const PayNowButton = styled.button`
  width: 90%;
  min-height: 12vh;
  max-height: 15vh;
  margin: 1vh;
  font-size: 3.5vh;
  min-width: 8vh;
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
  max-width: 7vh;
  font-size: 10vh;
  padding-left: 4vh;
`;

const VoucherInput = styled.input`
  max-width: 30vh;
  font-size: 9vh;
  font-variant: all-small-caps;
  text-align: center;
  &::placeholder {
    font-variant: normal;
    font-size: 4vh;
  }
`;

const CurrencyLabel = styled.div`
  position: relative;
  right: -2vh;
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
    return Number.isSafeInteger(asFloat) && asFloat > 0;
  };
  return (
    <>
      <SubmitDollarVotePanelContents>
        <EntryWrapper>
          <DollarEntryComponent>
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
          </DollarEntryComponent>
          <VoucherInput
            name={"voucher"}
            defaultValue={voucher}
            required={false}
            step={2}
            minLength={6}
            type={"text"}
            pattern="[a-zA-Z0-9]*"
            onInput={(e) => {
              setVoucher(e.currentTarget.value);
            }}
            placeholder={"Got a voucher?"}
          />
        </EntryWrapper>

        <PayNowButton
          disabled={!isReady()}
          onClick={() =>
            onSubmit({
              value: Number.parseInt(requestValue),
              voucher: voucher,
            })
          }
        >
          Pay now!
        </PayNowButton>
      </SubmitDollarVotePanelContents>
    </>
  );
};
