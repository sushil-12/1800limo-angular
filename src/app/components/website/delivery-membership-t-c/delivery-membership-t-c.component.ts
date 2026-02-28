import { Component, OnInit } from '@angular/core';
import { Title, Meta, DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-delivery-membership-t-c',
  templateUrl: './delivery-membership-t-c.component.html',
  styleUrls: ['./delivery-membership-t-c.component.scss']
})
export class DeliveryMembershipTCComponent implements OnInit {

  deliveryMembershipData = {
    meta: {
      title: 'Delivery Membership Program Terms & Conditions | 1-800-LIMO.COM',
      description: 'Delivery Membership Program Terms & Conditions for 1-800-LIMO.COM',
      keywords: 'delivery membership, terms, conditions, 1800 limo'
    },
    badge: {
      iconClass: 'bi bi-file-earmark-ruled', // Using a relevant icon
      text: 'Terms & Conditions'
    },
    title: 'Delivery Membership Program Terms & Conditions',
    lastUpdated: 'June 5, 2018',
    description: 'These Delivery Membership Program Terms & Conditions contain the complete terms and conditions that apply to your participation in the 1-800-LIMO.COM Delivery Membership Program.',
    sections: [
      {
        iconClass: 'bi bi-file-earmark-text',
        title: 'CONTRACTUAL RELATIONSHIP',
        content: `
         <p>These Delivery Membership Program Terms &amp; Conditions ("Terms" or “Agreement”) contains the complete
            terms and conditions that apply to your participation in the 1-800-LIMO.COM (“1-800-LIMO.COM” or “we”)
            Delivery Membership Program described in this Agreement and the 1-800-LIMO.COM Delivery Membership Program
            Policy and Procedure Manual (“Delivery Membership Program Manual”). You may be referred to in this Agreement
            as “you,” “Affiliate,” Driver,” “Participant,” and you and 1-800-LIMO.COM may be referred to collectively as
            “us” or “the Parties.”</p>
         <p>These Terms govern the access or use by you, an individual, from within the United States and globally,
            websites, content, products, and delivery of services (the "Services") made available in the United States
            and globally 1-800-LIMO.COM and its subsidiaries (collectively, "1-800-LIMO.COM"). PLEASE READ THESE TERMS
            CAREFULLY BEFORE ACCESSING OR USING THE SERVICES. In these Terms, the words "including" and "include" mean
            "including, but not limited to."</p>
         <p>Your access and use of the Services constitutes your agreement to be bound by these Terms, which establishes
            a contractual relationship between you and 1-800-LIMO.COM. If you do not agree to these Terms, you may not
            access, use, or deliver the Services. These Terms expressly supersede prior agreements or arrangements with
            you. 1-800-LIMO.COM may immediately terminate these Terms or any Services with respect to you, or generally
            cease offering or deny access to the Services or any portion thereof, at any time for any reason.</p>
         <p>Supplemental terms may apply to certain Services, including policies for an event, activity or promotion,
            and such supplemental terms will be disclosed to you in connection with the applicable Service(s).
            Supplemental terms are in addition to, and shall be deemed a part of, the Terms for the purposes of the
            applicable Service(s). Supplemental terms shall prevail over these Terms in the event of a conflict with
            respect to the applicable Services.</p>
         <p>Your use of the 1-800-LIMO.COM Technology Platform (the “Platform or "Website") is governed by these Terms
            &amp; Conditions, and the Client Terms &amp; Conditions, if applicable. 1-800-LIMO.COM may amend the Terms
            related to the Services from time to time. Amendments will be effective on 1-800-LIMO.COM's posting of such
            updated Terms at this location or the amended policies or supplemental terms on the applicable Service(s).
            Your continued access or use of the Services after such posting constitutes your consent to be bound by the
            Terms, as amended. If you do not agree to these terms, please do not use this Platform nor deliver Services.
         </p>
        `
      },
      {
        iconClass: 'bi bi-file-earmark-text',
        title: 'AGREEMENT TERM',
        content: `
         <p>This Agreement will commence on 1-800-LIMO.COM’s acceptance of this Agreement and will continue until either
            party terminates this Agreement, with or without cause, on notice of termination to the other party.</p>
        `
      },
      {
        iconClass: 'bi bi-file-earmark-text',
        title: 'SERVICES',
        content: `
         <p>To commence the process of enrolling as a Participant in the Delivery Membership Program, you must complete
            registration in the Registration section of our website. We will evaluate your registration and will only
            notify you if we reject your registration for any reason within a reasonable time. The rationale and timing
            shall be in our sole discretion. You shall observe the operational guidelines set forth in the
            1-800-LIMO.COM Delivery Membership Program Policy and Procedure Manual.</p>
         <p>You will provide ground transportation services (“Services”) in a timely and professional manner in
            accordance with this Agreement and the applicable 1-800-LIMO.COM Service Order. 1-800-LIMO.COM will
            establish, maintain, and update performance standards for the Services in the Delivery Membership Program
            Manual.</p>
         <p>1-800-LIMO.COM will pay fees (“Service Fees”) to you for the Services that you perform in accordance with
            this Agreement as documented in the applicable Service Order and the Delivery Membership Program Manual as
            in effect at the time the Services are provided. 1-800-LIMO.COM will publish and the Service Fees in the
            Delivery Membership Program Manual and update the Service Fees periodically.</p>
        `
      },
      {
        iconClass: 'bi bi-file-earmark-text',
        title: 'DELIVERY MEMBERSHIP PROGRAM PARTICIPANT REPRESENTATIONS AND WARRANTIES',
        content: `
         <p>By providing Services as a Participant for 1-800-LIMO.COM in our Delivery Membership Program, you represent,
            warrant, and agree that:</p>
         <ul>
            <li>You have passed a legally accepted background check and can provide proof on request.</li>
            <li>You possess a valid driver’s license and are authorized and medically fit to operate a motor vehicle and
               have all appropriate licenses, approvals and authority to provide transportation to Riders in all
               jurisdictions in which you provide Services.</li>
            <li>You own, or have the legal right to operate, the vehicle you use when providing Services, and such
               vehicle is in good operating condition and meets the industry safety standards and all applicable
               statutory and state department of motor vehicle requirements for a vehicle of its kind.</li>
            <li>You will only provide Services using the approved vehicle that has been reported to, registered and for
               which a photograph has been provided to 1-800-LIMO.COM, and you will not transport more passengers than
               can securely be seated in such vehicle (and no more than seven (7) passengers in any instance).</li>
            <li>You have a valid policy of liability insurance (in coverage amounts consistent with all applicable legal
               requirements) that names or schedules you for the operation of the vehicle you use to provide Services.
            </li>
            <li>You will be solely responsible for all liability that results from or is alleged because of your
               provision of Services, including, but not limited to personal injuries, death and property damages,
               however, this provision shall not limit the scope of 1-800-LIMO.COM’s insurance policies.</li>
            <li>In the event of a motor vehicle accident you will be solely responsible for compliance with any
               applicable statutory or department of motor vehicles requirements, for reporting the accident to
               1-800-LIMO.COM and your insurer in a timely manner, and for all necessary contacts with your insurance
               carrier.</li>
            <li>You will comply with all applicable laws, rules and regulations while providing Services, and you will
               be solely responsible for any violations of such provisions.</li>
            <li>You will pay all applicable federal, state and local taxes based on your provision of Services and any
               payments received by you.</li>
            <li>You will not make any misrepresentation regarding 1-800-LIMO.COM, the Services or your status as a
               Contractor, or, while providing the Services, operate as a public carrier or taxi service, accept street
               hails, charge for rides (except as expressly provided in this Agreement), or engage in any other activity
               in a manner that is inconsistent with your obligations under this Agreement.</li>
            <li>You will not attempt to defraud 1-800-LIMO.COM or Clients in connection with your provision of Services.
               If we suspect that you have engaged in fraudulent activity we may withhold applicable Fees or other
               payments for the ride(s) in question.</li>
            <li>You will always treat Clients with respect, dignity, and professionalism. You will not commit any crime
               against, nor exhibit unprofessional behavior toward, the Client in any way at any time. You will not
               discriminate or harass the Client based on race, national origin, religion, gender, gender identity,
               physical or mental disability, medical condition, marital status, age or sexual orientation. You will
               make reasonable accommodation for Client baggage and service animals.</li>
            <li>You agree that we may obtain information about you, including your criminal and driving records, and you
               agree to provide any further necessary authorizations to facilitate our access to such records during the
               term of the Agreement.</li>
         </ul>
        `
      },
      {
        iconClass: 'bi bi-file-earmark-text',
        title: 'DISTRACTED DRIVER POLICY',
        content: `
         <p>In addition to the terms and conditions outlined above. You are also bound by our Distracted Driving Policy
            which stipulates:</p>
         <ul>
            <li>Drivers are not to be accompanied by any other persons, other than 1-800-LIMO.COM employees, while
               operating the vehicle, except the Client’s guests.</li>
            <li>All Drivers must utilize a hands-free device or Bluetooth technology when using a mobile phone while
               driving or pull off the road to a safe area if they do not have a hands-free device or Bluetooth
               technology.</li>
            <li>Drivers are not permitted to use headphones while driving.</li>
         </ul>
        `
      },
      {
        iconClass: 'bi bi-file-earmark-text',
        title: 'REFERRALS',
        content: `
         <p>You may from time to time refer to 1-800-LIMO.COM a prospective client for Services that does not have an
            established account with 1-800-LIMO.COM (each, a “Referral”) in accordance with the then current Delivery
            Membership Program Manual.</p>
         <p>1-800-LIMO.COM.com will pay you a Referral Commission (“Referral Commission”) for referrals that you provide
            in accordance with the Delivery Membership Program Manual. 1-800-LIMO.COM will publish and periodically
            update the Referral Commissions in the Delivery Membership Program Manual.</p>
        `
      },
      {
        iconClass: 'bi bi-file-earmark-text',
        title: 'LEGAL COMPLIANCE',
        content: `
         <p>You will provide all Services in compliance with all applicable laws, codes, licensing requirements and
            regulations, and will be solely responsible to obtain all required governmental authorizations necessary for
            the full performance of the Services and this Agreement. You hereby further represent and warrant that: (a)
            if a corporation, you are duly organized and validly existing and in good standing under the laws of the
            state of your incorporation; (b) you are duly authorized and have full power and authority to enter into
            this Agreement and to perform your obligations hereunder; (c) you have obtained all permits, licenses, and
            other governmental authorizations and approvals required for your performance under this Agreement; (d) your
            performance of the Services and this Agreement will not conflict with or violate (i) any provision of law,
            rule or regulation to which you are subject, (ii) any order, judgment or decree applicable to you (iii) any
            provision of Participant by-laws or certificates of incorporation, or (iv) any agreement.</p>
        `
      },
      {
        iconClass: 'bi bi-file-earmark-text',
        title: '1-800-LIMO.COM PROMOTION',
        content: `
         <p>Participant shall not create, publish, distribute, or permit any written material that names or references
            1-800-LIMO.COM without first submitting such material to 1-800-LIMO.COM and receiving 1-800-LIMO.COM prior
            written consent.</p>
        `
      },
      {
        iconClass: 'bi bi-file-earmark-text',
        title: 'CONFIDENTIALITY',
        content: `
         <p>In performing the Services contained in this Agreement, either or both 1-800-LIMO-COM and Participant,
            (“disclosing party” or “receiving party”) may disclose to the other certain information (“Information”)
            which is considered by the disclosing party to be proprietary or confidential information, including,
            without limitation, the term of this Agreement, business, marketing and financial information, customer and
            vendor lists, including name, address and travel information, and pricing and sales information. All
            Information shall remain the sole property of the disclosing party, and the receiving party shall maintain
            and protect the confidentiality of the Information using the same degree of care as the receiving party uses
            to protect its own confidential and proprietary Information, but not less than a reasonable degree of care.
            The receiving party may only use the disclosing party’s Information to perform the Services contained in
            this Agreement and shall not disclose such Information to any third party without the prior written consent
            of the disclosing party. The restrictions of the use or disclosure of any Information shall not apply to any
            information; (i) after it has become generally available to the public without breach of this Agreement by
            the receiving party; (ii) is independently developed by receiving party without use of or reference to the
            Information provided hereunder; (iii) is rightfully in the receiving party’s possession prior to disclosure
            to it by the disclosing party, (iv) is rightfully received by receiving party from a third party without
            duty of confidentiality; or (v) is disclosed under operation of law or pursuant to legal or regulatory
            process.</p>
        `
      },
      {
        iconClass: 'bi bi-file-earmark-text',
        title: 'LIABILITY',
        content: `
         <p>1-800-LIMO.COM’S AGGREGATE LIABILITY TO YOU FOR ANY CLAIM ARISING IN CONNECTION WITH THIS AGREEMENT (WHETHER
            IN CONTRACT, TORT, OR ANY OTHER THEORY OF RECOVERY) SHALL IN NO EVENT EXCEED THE APPLICABLE FEES OR
            COMMISSIONS ACTUALLY PAID OR PAYABLE TO PARTICIPANT DURING THE ONE (1) MONTH PRECEDING THE APPLICABLE CLAIM.
            IN NO EVENT SHALL 1-800-LIMO.COM HAVE ANY LIABILITY HEREUNDER FOR ANY INDIRECT, SPECIAL, PUNITIVE OR
            CONSEQUENTIAL DAMAGES INCLUDING, WITHOUT LIMITATION, LOSS OF PROFIT OR BUSINESS OPPORTUNITIES, WHETHER OR
            NOT 1-800-LIMO.COM KNEW OR SHOULD HAVE KNOWN THAT SUCH DAMAGE MIGHT BE INCURRED.</p>
        `
      },
      {
        iconClass: 'bi bi-file-earmark-text',
        title: 'INDEMNIFICATION',
        content: `
         <p>You shall indemnify, defend and hold harmless 1-800-LIMO.COM, its affiliates, successors and assigns and
            their respective officers, directors, shareholders, employees, and suppliers, from and against any and all
            losses, liabilities, damages, actions, claims, expenses, and costs including, without limitation, reasonable
            attorneys' fees, which result or arise from or are based on (i) the negligence or willful misconduct of you,
            your agents, servants and/or employees, (ii) your breach of this Agreement or any of the terms hereunder,
            (iii) any misrepresentation of a representation or warranty, or breach of a covenant or agreement made by
            you in this Agreement or in the Registration process.</p>
        `
      },
      {
        iconClass: 'bi bi-file-earmark-text',
        title: 'INDEPENDENT PARTIES',
        content: `
         <p>You and 1-800-LIMO.COM are independent contractors with respect to each other in connection with this
            Agreement. Nothing contained herein shall imply any partnership, joint venture, or agency relationship
            between the Parties and neither of us shall have the power to obligate or bind the other in any manner
            whatsoever.</p>
        `
      },
      {
        iconClass: 'bi bi-file-earmark-text',
        title: 'BINDING EFFECT',
        content: `
         <p>This Agreement shall inure to the benefit of and be binding on the Parties hereto and their respective
            successors and assigns. Nothing in this Agreement, expressed or implied, is intended to confer on any person
            or entity other than the Parties hereto or their respective successors and assigns, any rights, remedies,
            obligations, or liabilities under or by reason of this Agreement.</p>
        `
      },
      {
        iconClass: 'bi bi-file-earmark-text',
        title: 'SEVERABILITY',
        content: `
         <p>If any provision of this Agreement shall be declared by any court of competent jurisdiction to be illegal,
            void, or unenforceable, all remaining provisions of this Agreement shall not be affected and shall remain in
            full force and effect.</p>
        `
      },
      {
        iconClass: 'bi bi-file-earmark-text',
        title: 'NOTICES',
        content: `
         <p>Any notices required or permitted under this Agreement shall be sent in accordance with the information
            provided by you within your Registration, or to 1-800-LIMO.COM at info&#64;1800limo.com and shall be deemed duly
            made and received when sent, provided the sender requests and can provide an electronic return receipt.</p>
        `
      },
      {
        iconClass: 'bi bi-file-earmark-text',
        title: 'ENTIRE AGREEMENT',
        content: `
         <p>This Agreement and the Delivery Membership Program Manual constitutes (a) the binding agreement between the
            Parties; (b) represents the entire agreement between the Parties relating to the subject matter hereof and
            supersedes all prior agreements; and (c) may not be modified or amended except as set forth herein.
            Notwithstanding anything to the contrary contained herein, 1-800-LIMO.COM may modify and change any of the
            terms and conditions of this Agreement, at any time in its sole discretion on written or electronic notice
            in accordance with Section 1(e) of this Agreement.</p>
        `
      },
      {
        iconClass: 'bi bi-file-earmark-text',
        title: 'GOVERNING LAW',
        content: `
         <p>This Agreement shall be governed by and construed in accordance with the internal laws of the State of
            Illinois without regard to conflicts of law principles thereof.</p>
        `
      },
      {
        iconClass: 'bi bi-file-earmark-text',
        title: 'ARBITRATION',
        content: `
         <p>Each Party hereby agrees to submit to binding arbitration, all disputes or controversies arising out of or
            in conjunction with this Agreement in accordance with the commercial arbitration rules of the American
            Arbitration Association (AAA) then in effect and judgment upon the award shall be final and unappealable and
            may be entered in any court having jurisdiction thereof. Nothing contained herein shall, however, be
            construed to limit or preclude 1-800-LIMO.COM from bringing any action in any court of competent
            jurisdiction for injunctive or other provisional relief as 1-800-LIMO.COM may deem to be necessary or
            appropriate against conduct or threatened conduct by Participant.</p>
        `
      },
      {
        iconClass: 'bi bi-file-earmark-text',
        title: 'NO WARRANTIES',
        content: `
         <p>1-800-LIMO.COM MAKES NO EXPRESS OR IMPLIED WARRANTIES IN CONNECTION WITH THIS AGREEMENT, INCLUDING, WITHOUT
            LIMITATION, WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, NON-INFRINGEMENT, OR ANY
            IMPLIED WARRANTIES ARISING OUT OF PERFORMANCE, DEALING, OR TRADE USAGE. IN ADDITION, 1-800-LIMO.COM MAKES NO
            REPRESENTATION THAT THE OPERATION OF 1-800-LIMO.COM’S OPERATIONS WILL BE UNINTERRUPTED OR ERROR-FREE, AND
            1-800-LIMO.COM WILL NOT BE LIABLE FOR ANY CONSEQUENCES WHATSOEVER OF ANY INTERRUPTIONS OR ERRORS.
            FURTHERMORE, 1-800-LIMO.COM MAKES NO REPRESENTATION, WARRANTY OR GUARANTEE AS TO THE AMOUNT OF FEES OR
            COMMISSIONS TO BE PAID TO PARTICIPANT HEREUNDER.</p>
        `
      },
      {
        iconClass: 'bi bi-file-earmark-text',
        title: 'SURVIVAL',
        content: `
         <p>The following sections of this Agreement shall survive the termination or Expiry of this Agreement:</p>
         <ul>
            <li>PROMOTION</li>
            <li>CONFIDENTIALITY</li>
            <li>LIABILITY</li>
            <li>INDEMNIFICATION</li>
            <li>ARBITRATION</li>
            <li>NO WARRANTIES</li>
         </ul>
         <p>USE OF ELECTRONIC FINANCIAL PAYMENT PLATFORM You expressly authorize 1-800-LIMO.COM’s service provider,
            Dwolla, Inc., to originate credit transfers to your financial institution account.</p>
        `
      },
      {
        iconClass: 'bi bi-file-earmark-text',
        title: 'ADDITIONAL DISCLOSURES',
        content: `
         <p>You understand and agree that 1-800-LIMO.COM may at any time, directly or indirectly, solicit client
            referrals, enter into similar agreements, and may enter into agreements with your competitors.</p>
         <p>1-800-LIMO.COM MAY FROM TIME TO TIME AMEND, MODIFY OR SUPPLEMENT THIS AGREEMENT OR THE DELIVERY MEMBERSHIP
            PROGRAM MANUAL IN ITS SOLE DISCRETION ON WRITTEN, ELECTRONIC OR FACSIMILE NOTICE TO YOU. YOU AGREE THAT YOU
            ARE BOUND TO COMPLY WITH ALL SUCH AMENDMENTS OR MODIFICATIONS. ALL SUCH CHANGES SHALL BE EFFECTIVE ON YOUR
            RECEIPT OF SUCH NOTICE AND YOUR ACCEPTANCE OF A SERVICE ORDER OR PROVIDING A REFERRAL SHALL EVIDENCE YOUR
            ACCEPTANCE OF SUCH CHANGES. IF YOU DO NOT AGREE TO SUCH CHANGES, YOU MAY TERMINATE THIS DELIVERY AGREEMENT
            IN ACCORDANCE WITH ITS TERMS.</p>
         <p>IN ADDITION TO THE TERMS SPECIFIED ABOVE, YOU ALSO AGREE THAT WHILE OPERATING ON THE DIGITAL NETWORK OR
            SOFTWARE APPLICATION OF THE COMMERCIAL TRANSPORTATION SERVICES PROVIDER, YOUR PRIVATE PASSENGER AUTOMOBILE
            INSURANCE POLICY MIGHT NOT AFFORD LIABILITY, UNDERINSURED MOTORIST, PERSONAL INJURY PROTECTION,
            COMPEREHENSIVE, OR COLLISION COVERAGE, DEPENDING ON THE TERMS OF THE POLICY.</p>
         <p>IF THE VEHICLE THAT YOU PLAN TO USE TO PROVIDE COMMERICIAL TRANSPORTATION SERVICES FOR 1-800-LIMO.COM HAS A
            LIEN AGAINST IT, YOU MUST NOTIFY THE LIENHOLDER THAT YOU WILL BE USING THE VEHICLE FOR COMMERCIAL
            TRANSPORTATION SERVICES WHICH MAY VIOLATE THE TERMS OF YOUR CONTRACT WITH THE LIENHOLDER.</p>
        `
      },
      {
        iconClass: 'bi bi-file-earmark-text',
        title: 'CONTACTING 1-800-LIMO.COM',
        content: `
         <p>If you have any questions regarding this Delivery Membership Program Terms &amp; Conditions or the practices
            of this website, please contact us by sending an email to info&#64;1800limo.com.</p>
        `
      }
    ]
  };

  safeSections: any[] = [];

  constructor(private titleService: Title, private metaService: Meta, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.titleService.setTitle(this.deliveryMembershipData.meta.title);
    this.metaService.updateTag({ name: 'description', content: this.deliveryMembershipData.meta.description });
    this.metaService.updateTag({ name: 'keywords', content: this.deliveryMembershipData.meta.keywords });

    // Sanitize the HTML content
    this.safeSections = this.deliveryMembershipData.sections.map(section => ({
      ...section,
      safeContent: this.sanitizer.bypassSecurityTrustHtml(section.content)
    }));
  }
}
