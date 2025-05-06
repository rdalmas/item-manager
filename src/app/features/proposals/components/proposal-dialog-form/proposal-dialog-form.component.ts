import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Item } from '../../../../core/models/item.interface';
import { ProposalService } from '../../../../core/services/proposal.service';
import { OwnerService } from '../../../../core/services/owner.service';

@Component({
  selector: 'app-proposal-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './proposal-dialog-form.component.html',
  styleUrls: ['./proposal-dialog-form.component.scss']
})
export class ProposalFormDialogComponent {
  proposalForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProposalFormDialogComponent>,
    private proposalService: ProposalService,
    private ownerService: OwnerService,
    @Inject(MAT_DIALOG_DATA) public data: {
      item: Item;
      isCounter: boolean;
      previousProposalId?: number;
    }
  ) {
    this.proposalForm = this.createForm();
    this.initializeRatios(data.item.ownerIds);
  }

  private createForm(): FormGroup {
    return this.fb.group({
      ratios: this.fb.array([], {
        validators: this.totalPercentageValidator()
      }),
      message: ['', this.data.isCounter ? Validators.required : []]
    });
  }

  getPartyName(partyId: number): string {
    return this.ownerService.getOwnerName(partyId);
  }

  private initializeRatios(ownerIds: number[]): void {
    const ratiosArray = this.proposalForm.get('ratios') as FormArray;
    ownerIds.forEach(ownerId => {
      ratiosArray.push(this.fb.group({
        partyId: [ownerId],
        percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
      }));
    });
  }

  get ratios(): FormArray {
    return this.proposalForm.get('ratios') as FormArray;
  }

  totalPercentageValidator(): ValidatorFn {
    return (formArray: AbstractControl): ValidationErrors | null => {
      if (!(formArray instanceof FormArray)) return null;
      
      const sum = formArray.controls
        .reduce((total, control) => total + (control.get('percentage')?.value || 0), 0);
      
      return sum === 100 ? null : { totalPercentage: true };
    };
  }

  onSubmit(): void {
    if (this.proposalForm.invalid || !this.totalPercentageValidator()) return;

    const proposal = {
      itemId: this.data.item.id,
      itemName: this.data.item.name,
      message: this.proposalForm.get('message')?.value,
      ratios: this.ratios.value,
      isCounterProposal: this.data.isCounter,
      previousProposalId: this.data.previousProposalId
    };

    this.proposalService.createProposal(proposal).subscribe(() => {
      this.dialogRef.close(true);
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}