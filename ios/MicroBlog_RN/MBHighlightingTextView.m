//
//  MBHighlightingTextView.m
//  MicroBlog_RN
//
//  Created by Manton Reece on 4/16/23.
//

#import "MBHighlightingTextView.h"

#import <React/UIView+React.h>

@interface MBHighlightingTextView ()

@property (assign, nonatomic) BOOL did_setup_keyboard_notifications;
@property (assign, nonatomic) UIEdgeInsets base_content_inset;
@property (assign, nonatomic) UIEdgeInsets base_scroll_indicator_inset;
@property (assign, nonatomic) CGFloat keyboard_overlap_height;

@end

@implementation MBHighlightingTextView

- (void) dealloc
{
  if (self.did_setup_keyboard_notifications) {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
  }
}

- (void) setupKeyboardNotificationsIfNeeded
{
  if (self.did_setup_keyboard_notifications) {
    return;
  }

  self.base_content_inset = self.contentInset;
  self.base_scroll_indicator_inset = self.scrollIndicatorInsets;

  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(keyboardWillChangeFrameNotification:) name:UIKeyboardWillChangeFrameNotification object:nil];
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(keyboardWillHideNotification:) name:UIKeyboardWillHideNotification object:nil];

  self.did_setup_keyboard_notifications = YES;
}

- (void) applyBottomInset:(CGFloat)bottom_inset duration:(NSTimeInterval)duration curve:(UIViewAnimationCurve)curve scrollCaretToSelection:(BOOL)scroll_caret_to_selection
{
  UIEdgeInsets content_inset = self.base_content_inset;
  content_inset.bottom += bottom_inset;

  UIEdgeInsets indicator_inset = self.base_scroll_indicator_inset;
  indicator_inset.bottom += bottom_inset;

  UIViewAnimationOptions options = ((NSUInteger) curve << 16) | UIViewAnimationOptionBeginFromCurrentState;
  [UIView animateWithDuration:duration delay:0 options:options animations:^{
    self.contentInset = content_inset;
    self.scrollIndicatorInsets = indicator_inset;
  } completion:nil];

  if (scroll_caret_to_selection && self.selectedTextRange != nil) {
    CGRect caret_rect = [self caretRectForPosition:self.selectedTextRange.end];
    [self scrollRectToVisible:CGRectInset(caret_rect, 0, -8) animated:NO];
  }
}

- (void) updateInsetsWithDuration:(NSTimeInterval)duration curve:(UIViewAnimationCurve)curve scrollCaretToSelection:(BOOL)scroll_caret_to_selection
{
  CGFloat bottom_inset = self.keyboard_overlap_height + self.bottom_overlay_height;
  [self applyBottomInset:bottom_inset duration:duration curve:curve scrollCaretToSelection:scroll_caret_to_selection];
}

- (void) refreshInsets
{
  [self updateInsetsWithDuration:0 curve:UIViewAnimationCurveEaseInOut scrollCaretToSelection:NO];
}

- (BOOL) isIpad
{
  return (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad);
}

- (BOOL) isIpadPortrait
{
  BOOL is_ipad = (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad);
  BOOL is_portrait = (UIDevice.currentDevice.orientation == UIDeviceOrientationPortrait) || (UIDevice.currentDevice.orientation == UIDeviceOrientationPortraitUpsideDown);

  return (is_ipad && is_portrait);
}

- (void) didMoveToWindow
{
  [super didMoveToWindow];

  [self setupKeyboardNotificationsIfNeeded];
}

- (void) layoutSubviews
{
  [super layoutSubviews];

  [self updateInsetsWithDuration:0 curve:UIViewAnimationCurveEaseInOut scrollCaretToSelection:NO];
}

- (void) callTextChanged:(NSString *)text
{
  if (self.onChangeText) {
    self.onChangeText(@{ @"text": text });
  }
}

- (void) callSelectionChanged:(UITextRange *)range
{
  if (self.onSelectionChange) {
    NSInteger start = [self offsetFromPosition:self.beginningOfDocument toPosition:range.start];
    NSInteger end = [self offsetFromPosition:self.beginningOfDocument toPosition:range.end];

    self.onSelectionChange(@{
      @"selection": @{
        @"start": @(start),
        @"end": @(end)
      }
    });
  }
}

#pragma mark -

- (void) keyboardWillChangeFrameNotification:(NSNotification*)notification
{
  NSDictionary* info = [notification userInfo];
  CGRect kb_r = [[info objectForKey:UIKeyboardFrameEndUserInfoKey] CGRectValue];
  CGRect kb_in_view_r = [self convertRect:kb_r fromView:nil];
  CGRect intersection = CGRectIntersection(self.bounds, kb_in_view_r);

  CGFloat covered_height = CGRectIsNull(intersection) ? 0.0 : intersection.size.height;
  if (covered_height > 0 && self.inputAccessoryView != nil && self.bottom_overlay_height <= 0) {
    covered_height += self.inputAccessoryView.bounds.size.height;
  }

  self.keyboard_overlap_height = covered_height;
  NSTimeInterval duration = [[info objectForKey:UIKeyboardAnimationDurationUserInfoKey] doubleValue];
  UIViewAnimationCurve curve = (UIViewAnimationCurve) [[info objectForKey:UIKeyboardAnimationCurveUserInfoKey] integerValue];
  [self updateInsetsWithDuration:duration curve:curve scrollCaretToSelection:YES];
}

- (void) keyboardWillHideNotification:(NSNotification*)notification
{
  NSDictionary* info = [notification userInfo];
  self.keyboard_overlap_height = 0;
  NSTimeInterval duration = [[info objectForKey:UIKeyboardAnimationDurationUserInfoKey] doubleValue];
  UIViewAnimationCurve curve = (UIViewAnimationCurve) [[info objectForKey:UIKeyboardAnimationCurveUserInfoKey] integerValue];
  [self updateInsetsWithDuration:duration curve:curve scrollCaretToSelection:NO];
}

@end
