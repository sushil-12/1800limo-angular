import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-booking-logs',
  templateUrl: './booking-logs.component.html',
  styleUrls: ['./booking-logs.component.scss']
})
export class BookingLogsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  dataSource = ELEMENT_DATA;
  columnsToDisplay = [
    'id',
    'booking_type',
    'affiliate_id',
    'booking_status',
    // 'Description',
  ];
  expandedElement: PeriodicElement | null;

}

export interface PeriodicElement {
  id: number;
  affiliate_id: number;
  booking_status: string;
  booking_type: string;
  // description: string;
  charges: Array<any>;
  payment_details: Object;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    id: 783,
    booking_status: 'partial_paid',
    booking_type: 'Affiliate',
    affiliate_id: 136,
    charges: [
      {
        id: 'ch_3NBxeWKoNaQmPl6m01ap3AZB',
        amount_captured: 3528,
        amount_refunded: 3128,
        transfer: {
          pay_id: 'py_1NBxeX4KVTQDhPsIw0a5yB4U',
          transfer_amount: 2513,
          application_fee: null,
          application_fee_amount: null,
          currency: 'usd',
          status: 'succeeded',
          receipt_url:
            'https://pay.stripe.com/receipts/payment/CAcaFwoVYWNjdF8xTXVIQjk0S1ZUUURoUHNJKPfY0qMGMgZ6_b3uLeo6LBY8Z2xT7_TY23Y-lyPQSR8OjbBZ1SpNdLR8D0TSedkWKcfZxUVNUTpXhKIM',
          transfer_balance_transaction: 'txn_1NBxeX4KVTQDhPsIqPcE3fPM',
          created: 1685096025,
          account_name: 'test holder',
          account_id: 36,
        },
        description: 'Payment of reservation : 783',
      },
    ],
    payment_details: {
      payment_method: 'credit_card',
      charge_object_array: '{"0":"ch_3NBxeWKoNaQmPl6m01ap3AZB"}',
      charge_object_id: 'ch_3NBxeWKoNaQmPl6m01ap3AZB',
      reservation_id: 783,
    },
  },
  {
    id: 771,
    booking_status: 'paid',
    booking_type: 'Loose Affiliate',
    affiliate_id: 0,
    charges: [
      {
        id: 'ch_3N9WVCKoNaQmPl6m1gLLBtJE',
        amount_captured: 945530,
        amount_refunded: 0,
        transfer: null,
        description: 'Payment of reservation : 771',
      },
    ],
    payment_details: {
      payment_method: 'credit_card',
      charge_object_array: '{"0":"ch_3N9WVCKoNaQmPl6m1gLLBtJE"}',
      charge_object_id: 'ch_3N9WVCKoNaQmPl6m1gLLBtJE',
      reservation_id: 771,
    },
  },
  {
    id: 724,
    booking_status: 'paid',
    booking_type: 'Affiliate',
    affiliate_id: 106,
    charges: [
      {
        id: 'ch_3N9NKpKoNaQmPl6m0qRCul1H',
        amount_captured: 281516,
        amount_refunded: 281516,
        transfer: {
          pay_id: 'py_1N9NKp4Dk67ouJfvGldzSEO5',
          transfer_amount: 202943,
          application_fee: null,
          application_fee_amount: null,
          currency: 'usd',
          status: 'succeeded',
          receipt_url:
            'https://pay.stripe.com/receipts/payment/CAcaFwoVYWNjdF8xTWx0VVU0RGs2N291SmZ2KPjY0qMGMgYYRHqdTHI6LBaWdmU7EfgpOU9YRHtROuj39-K1ndRKdXesZYu5JNFGGnu19SFIRtp9dVh8',
          transfer_balance_transaction: 'txn_1N9NKq4Dk67ouJfvt80TUvME',
          created: 1684479763,
          account_name: 'demok kisn',
          account_id: 24,
        },
        description: 'Payment of reservation : 724',
      },
    ],
    payment_details: {
      payment_method: 'credit_card',
      charge_object_array: '{"0":"ch_3N9NKpKoNaQmPl6m0qRCul1H"}',
      charge_object_id: 'ch_3N9NKpKoNaQmPl6m0qRCul1H',
      reservation_id: 724,
    },
  },
  {
    id: 722,
    booking_status: 'partial_paid',
    booking_type: 'Affiliate',
    affiliate_id: 102,
    charges: [
      {
        id: 'ch_3N93T7KoNaQmPl6m1wbIR83v',
        amount_captured: 105002,
        amount_refunded: 55002,
        transfer: {
          pay_id: 'py_1N93T7QNN7lCxXot3Bm6MIsk',
          transfer_amount: 75676,
          application_fee: null,
          application_fee_amount: null,
          currency: 'usd',
          status: 'succeeded',
          receipt_url:
            'https://pay.stripe.com/receipts/payment/CAcaFwoVYWNjdF8xTWxCMjNRTk43bEN4WG90KPnY0qMGMgYhGyJuig86LBavMtKYe4L5L96l1kF4EnhzeWTq2CyWXTcCnqtPvxvARHesqEXaIcprarPq',
          transfer_balance_transaction: 'txn_1N93T7QNN7lCxXotT6iEXHQ2',
          created: 1684403397,
          account_name: 'fname lname',
          account_id: 22,
        },
        description: 'Payment of reservation : 722',
      },
      {
        id: 'ch_3N93VtKoNaQmPl6m1Xx4AhBG',
        amount_captured: 55002,
        amount_refunded: 50000,
        transfer: {
          pay_id: 'py_1N93VuQNN7lCxXotNxboxa91',
          transfer_amount: 39626,
          application_fee: null,
          application_fee_amount: null,
          currency: 'usd',
          status: 'succeeded',
          receipt_url:
            'https://pay.stripe.com/receipts/payment/CAcaFwoVYWNjdF8xTWxCMjNRTk43bEN4WG90KPrY0qMGMgbHQsQrb706LBbnTcHhZfGqaQ7XouuMxULhBdyoLOiCXxBzboIq7MYyKFdeqv142K4Bjeo2',
          transfer_balance_transaction: 'txn_1N93VuQNN7lCxXotiz2kqeAA',
          created: 1684403570,
          account_name: 'fname lname',
          account_id: 22,
        },
        description: 'Payment of reservation : 722',
      },
    ],
    payment_details: {
      payment_method: 'credit_card',
      charge_object_array:
        '{"0":"ch_3N93T7KoNaQmPl6m1wbIR83v","1":"ch_3N93VtKoNaQmPl6m1Xx4AhBG"}',
      charge_object_id: 'ch_3N93VtKoNaQmPl6m1Xx4AhBG',
      reservation_id: 722,
    },
  },
  {
    id: 721,
    booking_status: 'partial_paid',
    booking_type: 'Loose Affiliate',
    affiliate_id: 0,
    charges: [
      {
        id: 'ch_3N8PU4KoNaQmPl6m1jDO1ADg',
        amount_captured: 28750,
        amount_refunded: 8750,
        transfer: null,
        description: 'Payment of reservation : 721',
      },
    ],
    payment_details: {
      payment_method: 'credit_card',
      charge_object_array: '{"0":"ch_3N8PU4KoNaQmPl6m1jDO1ADg"}',
      charge_object_id: 'ch_3N8PU4KoNaQmPl6m1jDO1ADg',
      reservation_id: 721,
    },
  },
];