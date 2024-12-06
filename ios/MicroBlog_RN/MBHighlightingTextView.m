//
//  MBHighlightingTextView.m
//  MicroBlog_RN
//
//  Created by Manton Reece on 4/16/23.
//

#import "MBHighlightingTextView.h"

#import <React/UIView+React.h>

@implementation MBHighlightingTextView

- (id) init
{
  self = [super init];
  if (self) {
    self.keyboardHeight = 0;
  }

  return self;
}

- (void) setupNotifications
{
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(keyboardWillShowNotification:) name:UIKeyboardWillShowNotification object:nil];
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(keyboardWillHideNotification:) name:UIKeyboardWillHideNotification object:nil];
}

- (void) setupAccessoryView
{
  UIView* root = [self findRootView];
  UIView* v = [self findAccessoryViewFromView:root withNativeID:@"input_toolbar"];
  if (v) {
    self.reactAccessoryView = v;
    
    if (self.inputAccessoryView == nil) {
      self.inputAccessoryView = [self.reactAccessoryView inputAccessoryView];
      [self reloadInputViews];
    }
  }
}

- (void) adjustHeight
{
  [self adjustHeightForKeyboardHeight:self.keyboardHeight animated:NO];
}

- (void) adjustHeightForKeyboardHeight:(CGFloat)keyboardHeight
{
  [self adjustHeightForKeyboardHeight:keyboardHeight animated:YES];
}

- (void) adjustHeightForKeyboardHeight:(CGFloat)keyboardHeight animated:(BOOL)animated
{
  // adjust position and height taking into account other views
  UIView* parent = self.superview;
  if (parent) {
    CGFloat top_views_height = 0;
    CGFloat bottom_views_height = 0;
    
    bottom_views_height += self.inputAccessoryView.bounds.size.height;

    for (UIView* sibling_v in self.superview.subviews) {
      if ((sibling_v != self) && !sibling_v.hidden) {
        // views with origin < 200 are probably above the text view
        if (sibling_v.frame.origin.y < 200) {
          top_views_height += sibling_v.bounds.size.height;
        }
        else {
          bottom_views_height += sibling_v.bounds.size.height;
        }
      }
    }

    CGRect r = parent.bounds;
    r.origin.y = top_views_height;
    r.size.height = r.size.height - bottom_views_height - keyboardHeight;

    // only set frame and offset if height has changed
    if (self.frame.size.height != r.size.height) {
      self.frame = r;
      [self setContentOffset:CGPointZero animated:animated];
    }
  }
}

- (void) finishSetup
{
  [self setupNotifications];
  [self setupAccessoryView];
  [self adjustHeightForKeyboardHeight:0 animated:NO];
  
  self.hidden = NO;
}

- (void) didSetProps:(NSArray<NSString *> *)changedProps
{
}

- (UIView *) findRootView
{
  UIView* root = self;
  while ([root superview] != nil) {
      root = [root superview];
  }
  
  return root;
}

- (UIView *) findAccessoryViewFromView:(UIView *)view withNativeID:(NSString *)nativeID
{
  UIView* found_view = nil;

  // is this the view?
  if ([[view nativeID] isEqualToString:nativeID]) {
    return view;
  }

  // look at subviews and call recursively
  NSArray* subs = view.subviews;
  for (UIView* sub in subs) {
    found_view = [self findAccessoryViewFromView:sub withNativeID:nativeID];
    if (found_view) {
      break;
    }
  }
  
  return found_view;
}

- (void) didMoveToSuperview
{
  [super didMoveToSuperview];

  if (self.superview != nil) {
    // give the other React Native layout time to do whatever it's doing
    [self performSelector:@selector(finishSetup) withObject:nil afterDelay:1.0];
  }
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

- (void) keyboardWillShowNotification:(NSNotification*)notification
{
  NSDictionary* info = [notification userInfo];
  CGRect kb_r = [[info objectForKey:UIKeyboardFrameEndUserInfoKey] CGRectValue];
  
  // remember height for later layout
  self.keyboardHeight = kb_r.size.height;
  
  [UIView animateWithDuration:0.3 animations:^{
    [self adjustHeightForKeyboardHeight:kb_r.size.height];
    [self layoutIfNeeded];
  }];
}
 
- (void) keyboardWillHideNotification:(NSNotification*)aNotification
{
  [UIView animateWithDuration:0.3 animations:^{
    [self adjustHeightForKeyboardHeight:0];
    [self layoutIfNeeded];
  }];
}


@end
